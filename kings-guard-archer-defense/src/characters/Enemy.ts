// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Enemy extends AnimatedSprite {
        public enemyType: EnemySpecification;
        public weapon: Weapon;
        private attached: FiredProjectile[];
        private currentPath: Phaser.Point[];
        private currentDestination: Phaser.Point;
        private previousPosition: Phaser.Point;
        private damageTween: Phaser.Tween;
        private centerTween: Phaser.Tween;
        private moving: boolean;
        private recheckPathStartTime: number;
        private recheckPathTime: number;
        protected currentTarget: AnimatedSprite;
        protected targetAcquired: boolean;
        protected threatTable: ThreatTable;
        private debugStateName: string = "idle";
        private rerouting: boolean;
        private unblockTries = 0;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
            this.attached = [];
            this.movementSpeed = 75;
            this.tilePosition = null;
            this.lastTilePosition = null;
            this.rerouting = false;
            this.health = 3;
        }

        init(...args: any[]) {
            super.init(args);

            this.body.immovable = true;
            this.weapon = new Weapon(this.game, 'short_sword', 1500, 0, 1, 0, null);
            this.weapon.backSwing = 500;
            this.weapon.range = 32;

            if (args.length > 0) {
                this.enemyType = args[0];

                this.health = this.enemyType.health;
            }
        }

        addToWorld(): void {
            this.threatTable = new ThreatTable(this);
            this.threatTable.highestThreatChanged.add((who) => { this.onHighestThreatTargetChanged(who); });

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
                return 2;
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
            }

            if (this.health <= 0) {
                if (!OccupiedGrid.remove(this)) {
                    console.error("Enemy was not removed!");
                }

                if (this.movementTween != null && this.movementTween.isRunning) {
                    this.movementTween.stop(false);
                }
                this.currentPath = null;
                this.currentDestination = null;
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

            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }

            this.damageTween = this.game.add.tween(this).to({ tint: 0xFF3333 }, 35, Phaser.Easing.Cubic.InOut, true, 0, 2, true);

            return this;
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

            if (this.currentTarget == null) {
                this.currentTarget = this.threatTable.getHighestThreatTarget();
                if (this.currentTarget == null) {
                    this.debugStateName = 'no_target';
                    return;
                }
            }

            if (this.weapon.isBackSwinging() || this.isCentering() || this.rerouting || this.isMoveTweening()) {
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
            return;

            if (this.health <= 0) {
                return;
            }

            this.game.debug.text(this.debugStateName, this.x - 16, this.y - 16, '#FFFFFF', '12px Courier new');

            if (this.currentDestination != null) {
                //this.game.debug.geom(new Phaser.Rectangle(this.currentDestination.x - 16, this.currentDestination.y - 16, 32, 32), '#00FF00', false);
            }

            //this.pathFindingMover.render();

            //this.game.debug.geom(new Phaser.Rectangle(this.tilePosition.x * 32, this.tilePosition.y * 32, 32, 32));

            if (this.currentTarget != null) {
                /*var halfX = this.x - GameMap.TILE_WIDTH / 2;
                var halfY = this.y - GameMap.TILE_HEIGHT / 2;
                var tX = this.currentTarget.x - GameMap.TILE_WIDTH / 2;
                var tY = this.currentTarget.y - GameMap.TILE_HEIGHT / 2;
                var tW = this.currentTarget.width;
                var tH = this.currentTarget.height;
                var lines: Phaser.Line[] = [];
                lines[0] = new Phaser.Line(halfX, halfY, tX, tY);
                lines[1] = new Phaser.Line(halfX + this.width, halfY, tX + tW, tY);
                lines[2] = new Phaser.Line(halfX + this.width, halfY + this.height, tX + tW, tY + tH);
                lines[3] = new Phaser.Line(halfX, halfY + this.height, tX, tY + tH);

                for (i = 0; i < 4; ++i) {
                    this.game.debug.geom(lines[i]);
                }

                var sprite = this.currentTarget;
                var halfX = (this.x - GameMap.TILE_WIDTH / 2) + 1;
                var halfY = (this.y - GameMap.TILE_HEIGHT / 2) + 1;
                var tX = (sprite.x - GameMap.TILE_WIDTH / 2) + 1;
                var tY = (sprite.y - GameMap.TILE_HEIGHT / 2) + 1;
                var tW = sprite.width - 2;
                var tH = sprite.height - 2;
                var lines: Phaser.Line[] = [];
                lines[0] = new Phaser.Line(halfX, halfY, tX, tY);
                lines[1] = new Phaser.Line(halfX + this.width - 2, halfY, tX + tW, tY);
                lines[2] = new Phaser.Line(halfX + this.width - 2, halfY + this.height - 2, tX + tW, tY + tH);
                lines[3] = new Phaser.Line(halfX, halfY + this.height - 2, tX, tY + tH);
                lines[4] = new Phaser.Line(this.x, this.y, sprite.x, sprite.y);

                this.game.debug.geom(lines[4], '#00FF00', true);

                var sprites = CollisionHelper.raycastForSprites(lines[4], 4, this);
                for (var i = 0, l = sprites.length; i < l; ++i) {
                    var obstacle = sprites[i];
                    if (!(obstacle === sprite || obstacle === this)) {
                        this.game.debug.body(obstacle, '#FF3333', true);
                    }
                }*/
            }
        }

        /**
         *  Centers on the currently occupied tile.
         */
        public centerOnTile() {
            var map = Game.CurrentMap;
            var pos = this.tilePosition;
            var center = (<Phaser.Point>map.toPixels(pos)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
            this.stopMovementTween();

            if (this.centerTween != null && this.centerTween.isRunning) {
                this.centerTween.stop(false);
            }

            var timeToMove = Phaser.Point.distance(this.position, center) / this.movementSpeed * 1000;
            if (timeToMove === 0) {
                return;
            }

            this.centerTween = this.game.add.tween(this).to({ x: center.x, y: center.y }, timeToMove, Phaser.Easing.Linear.None, true, 0);
        }

        /**
         *  Gets or sets whether or not this enemy is centering on a tile.
         */
        private isCentering(): boolean {
            return this.centerTween != null && this.centerTween.isRunning;
        }

        /**
         *  Un-sets the current path, allowing a new one to be created.
         */
        private unsetCurrentPath(): any {
            this.currentPath = null;
            this.currentDestination = null;
            this.pathFindingMover.currentPath = null;

            return null;
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

            if (path == null || path.length === 0) {
                // Find a path to the target.
                this.currentPath = map.findPath(this.tilePosition, targetPositionTiles);
                this.pathFindingMover.setCurrentPath(new Path(this.currentPath));
            }

            if (this.currentPath != null && this.currentPath.length > 0) {
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
            this.currentTarget = sprite;
            this.unsetCurrentPath();
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

        /**
         *  Moves to the next destination in the pathfinding node.
         */
        private moveToNextDestination() {
            if (this.isMoveTweening()) {
                return;
            }

            var path = this.pathFindingMover.currentPath;
            if (path == null) {
                return;
            }

            var rect = path.next();
            if (rect == null) {
                this.pathFindingMover.currentPath = null;
                this.currentPath = null;
                return;
            }

            this.unblockTries = 0;

            this.debugStateName = 'moving';

            var center = new Phaser.Point(rect.centerX, rect.centerY);
            var angle = this.game.physics.arcade.angleBetween(this.position, center);
            this.direction = MovementHelper.getDirectionFromAngle(angle);
            this.action = Actions.Moving;
            this.updateAnimation();

            this.moveTweenTo(center);

            this.currentDestination = center;
        }
    }
}