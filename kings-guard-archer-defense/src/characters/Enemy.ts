// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Enemy extends AnimatedSprite {
        public enemyType: EnemySpecification;
        public weapon: Weapon;
        private attached: FiredProjectile[];
        private currentDestination: Phaser.Point;
        private previousPosition: Phaser.Point;
        private moving: boolean;
        private recheckPathStartTime: number;
        private recheckPathTime: number;
        protected currentTarget: AnimatedSprite;
        protected targetAcquired: boolean;
        protected threatTable: ThreatTable;
        private debugStateName: string = "idle";
        private rerouting: boolean;
        private unblockTries = 0;
        public goldValue: number;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
            this.attached = [];
            this.movementSpeed = 75;
            this.rerouting = false;
            this.health = 3;
            this.goldValue = 1;
        }

        init(...args: any[]) {
            super.init(args);

            this.hasHealthBar = true;
            this.body.immovable = true;

            this.weapon = new Weapon(this.game, 'short_sword', {
                cooldown: 1500,
                range: 42,
                backSwing: 500,
                power: 1,
            });

            if (args.length > 0) {
                this.enemyType = args[0];

                this.health = this.enemyType.health;
            }
        }

        addToWorld(): void {
            this.threatTable = new ThreatTable(this);
            this.threatTable.highestThreatChanged.add((who) => { this.onHighestThreatTargetChanged(who); });

            this.hasShadow = true;

            this.blocked.add((blockedBy) => {
                this.onBlocked(blockedBy);
            });

            super.addToWorld();
        }

        public get alliance(): Alliance {
            return Alliance.Enemy;
        }

        private onBlocked(blockedBy: AnimatedSprite[]) {
            this.stopMovementTween();

            if (this.rerouting) {
                return;
            }

            for (var i = 0, l = blockedBy.length; i < l; ++i) {
                var occupant = blockedBy[i];
                if (occupant.alliance !== this.alliance) {
                    this.threatTable.addThreat(occupant, 10);
                }
            }

            this.debugStateName = 'rerouting';
            this.game.time.events.add(100,() => {
                this.unsetCurrentPath();
                this.rerouting = false;
            }, this);

            this.rerouting = true;
        }

        public get weight(): number {
            if (this.rerouting) {
                return 0;
            }

            if (this.action == Actions.Firing || this.weapon.isBackSwinging()) {
                return 0;
            }
            else if (this.action == Actions.Moving) {
                return 20;
            }
            else if (this.action == Actions.Dying || this.action == Actions.Dead) {
                return 1;
            }

            return 5;
        }

        public inflictDamage(amount: number, source: AnimatedSprite): AnimatedSprite {
            var willDie = false;
            if (this.health - amount <= 0) {
                willDie = true;
            }

            if (!willDie) {
                this.threatTable.addThreat(source, amount);
                super.damage(amount);
            }
            else {
                this.health = 0;
                delete this.body;

                Game.Hero.gold += this.goldValue;
            }

            if (this.health <= 0) {
                if (this.shadowSprite) {
                    this.shadowSprite.kill();
                    this.hasShadow = false;
                }

                if (!OccupiedGrid.remove(this)) {
                    console.error("Enemy was not removed!");
                }

                this.showDeathAnimation();
            }

            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }

            //this.damageTween = this.game.add.tween(this).to({ tint: 0xFF3333 }, 35, Phaser.Easing.Cubic.InOut, true, 0, 2, true);
            this.damageTween = AnimationHelper.createDamageTween(this);
            this.damageTween.start();

            return this;
        }

        protected showDeathAnimation() {
            this.stopMovementTween();
            this.unsetCurrentPath();

            var onAnimationComplete = () => {
                this.action = Actions.Dead;
                this.updateAnimation();
                this.game.add.tween(this).to({ alpha: 0 }, 500).start().onComplete.addOnce(() => {
                    this.kill();
                });
            };

            this.action = Actions.Dying;
            this.direction = Directions.Down;
            this.updateAnimation(onAnimationComplete);
        }

        public attach(projectile: FiredProjectile) {
            this.attached.push(projectile);
            //projectile.attachTo(this);
        }

        preUpdate(): void {
            super.preUpdate();
        }

        update(): void {
            super.update();

            if (this.health <= 0) {
                return;
            }

            this.threatTable.update();
            this.pathFindingMover.update();

            while (this.currentTarget == null) {
                this.currentTarget = this.threatTable.getHighestThreatTarget();
                if (this.currentTarget != null && !this.canReach(this.currentTarget)) {
                    if (!(this.currentTarget instanceof King)) {
                        this.threatTable.removeThreatTarget(this.currentTarget);
                    }
                    else {
                        break;
                    }
                }
                else {
                    if (this.currentTarget == null) {
                        this.debugStateName = 'no_target';
                        return;
                    }

                    break;
                }
            }

            if (this.weapon.isBackSwinging() || this.rerouting || this.isMoveTweening()) {
                return;
            }

            if (!this.inRangeOf(this.currentTarget)) {
                this.seekTarget();
            }
            else {
                this.attackTarget();
            }
        }

        render() {
            if (this.health <= 0) {
                return;
            }

            //this.game.debug.text(this.debugStateName, this.position.x - 16, this.position.y - 16, '#FFFFFF', '12px Courier new');

            this.pathFindingMover.render();
        }

        /**
         *  Move towards a target.
         */
        private seekTarget() {
            this.action = Actions.Moving;
            var map = Game.CurrentMap;

            var targetPosition = this.currentTarget.position;
            var targetPositionTiles = <Phaser.Point>map.fromPixels(targetPosition);
            var targetBounds = OccupiedGrid.getBoundsOfSprite(this.currentTarget);

            var path = this.pathFindingMover.currentPath;

            if (path != null && path.length > 0) {
                var lastNode: Phaser.Rectangle = this.pathFindingMover.currentPath.peekLast();
                var targetNode = new Phaser.Rectangle(targetBounds.x, targetBounds.y, targetBounds.width, targetBounds.height);
                
                if (!Phaser.Rectangle.intersects(lastNode, targetNode)) {
                    path = this.unsetCurrentPath();
                }
            }

            var currentPath: Phaser.Point[] = null;

            if (path == null || path.length === 0) {
                // Find a path to the target.
                var tilePosition = <Phaser.Point>map.fromPixels(this.position);
                currentPath = map.findPath(tilePosition, targetPositionTiles);
                this.pathFindingMover.setCurrentPath(new Path(currentPath));
            }

            ;
            if (this.pathFindingMover.currentPath != null && this.pathFindingMover.currentPath.length > 0) {
                this.moveToNextDestination();
            }
        }

        /**
         *  Attacks the target.
         */
        private attackTarget() {
            this.action = Actions.Firing;
            this.body.velocity.setTo(0);
            this.face(this.currentTarget);
            this.updateAnimation();
            this.rerouting = false;

            if (this.weapon.canFire) {
                this.debugStateName = 'attacking';
                this.currentTarget.inflictDamage(this.weapon.power, this);
                if (!this.currentTarget.alive) {
                    this.threatTable.removeThreatTarget(this.currentTarget);
                    this.currentTarget = null;
                }

                this.weapon.lastFireTime = this.game.time.now;
            }
        }

        /**
         *  Called when the highest threat target has changed.
         */
        private onHighestThreatTargetChanged(sprite: AnimatedSprite) {
            if (sprite == null || this.canReach(sprite)) {
                this.currentTarget = sprite;
                this.unsetCurrentPath();
            }
        }

        /**
         *  Check if we can reach the current target.
         */
        private canReach(sprite: AnimatedSprite): boolean {
            if (sprite instanceof Mercenary) {
                if (sprite.isPerched) {
                    return false;
                }
            }

            var from = this.map.fromPixels(this.position);
            var to = this.map.fromPixels(sprite.position);
            return this.map.findPath(from, to, true) != null;
        }

        /**
         *  Checks if this enemy is in range of a sprite.
         */
        private inRangeOf(sprite: AnimatedSprite): boolean {
            var distance = Phaser.Point.distance(this.position, sprite.position)
            if (distance <= GameMap.TILE_WIDTH) {
                return true;
            }

            return false;
        }

        /**
         *  Checks if an obstacle is between this enemy and the target.
         */
        private getObstacleBetween(sprite: AnimatedSprite): AnimatedSprite {
            var line = new Phaser.Line(this.x, this.y, sprite.x, sprite.y);
            var sprites = CollisionHelper.raycastForSprites(line, 4, this);
            for (var i = 0, l = sprites.length; i < l; ++i) {
                var obstacle = sprites[i];
                if (obstacle === sprite || obstacle === this) {
                    continue;
                }

                return obstacle;
            }

            return null;
        }
    }
}