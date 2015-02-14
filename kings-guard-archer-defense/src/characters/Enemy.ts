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
        private currentTween: Phaser.Tween;
        private damageTween: Phaser.Tween;
        private speed: number;
        private moving: boolean;
        private recheckPathStartTime: number;
        private recheckPathTime: number;
        protected currentTarget: AnimatedSprite;
        protected targetAcquired: boolean;
        protected threatTable: ThreatTable;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
            this.attached = [];
            this.speed = 75;
            this.tilePosition = null;
            this.lastTilePosition = null;
        }

        init(...args: any[]) {
            super.init(args);

            this.body.immovable = true;
            this.weapon = new Weapon(this.game, 'short_sword', 1500, 0, 1, 0, null);

            if (args.length > 0) {
                this.enemyType = args[0];

                this.health = this.enemyType.health;
            }
        }

        addToWorld(): void {
            this.threatTable = new ThreatTable(this);
            this.threatTable.highestThreatChanged.add((who) => { this.onHighestThreatTargetChanged(who); });

            super.addToWorld();
        }

        public get weight(): number {
            if (this.action == Actions.Firing) {
                return 0;
            }
            else if (this.action == Actions.Moving) {
                return 2;
            }

            return 0;
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
                Game.CurrentMap.unoccupy(this);
                if (this.currentTween != null && this.currentTween.isRunning) {
                    this.currentTween.stop(false);
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

            if (this.currentTarget == null) {
                this.currentTarget = this.threatTable.getHighestThreatTarget();
                if (this.currentTarget == null) {
                    return;
                }
            }

            if (!this.inRangeOf(this.currentTarget)) {
                this.seekTarget();
            }
            else {
                this.attackTarget();
            }
        }

        render() {
            if (this.currentPath != null) {
                for (var i = 0, l = this.currentPath.length; i < l; ++i) {
                    var node = <Phaser.Point>Game.CurrentMap.toPixels(this.currentPath[i]);
                    this.game.debug.geom(new Phaser.Rectangle(node.x, node.y, 32, 32), "#FF0000", false);
                }
            }

            if (this.currentDestination != null) {
                this.game.debug.geom(new Phaser.Rectangle(this.currentDestination.x - 16, this.currentDestination.y - 16, 32, 32), '#00FF00', false);
            }

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
                }*/
            }
        }

        /**
         *  Move towards a target.
         */
        private seekTarget() {
            this.action = Actions.Moving;
            var info = GameInfo.CurrentGame;
            var map = Game.CurrentMap;

            var targetPosition = this.currentTarget.position;
            var targetPositionTiles = this.currentTarget.tilePosition;

            if (this.currentPath != null && this.currentPath.length > 0) {
                var enemyTile = this.currentPath[this.currentPath.length - 1];
                if (!targetPositionTiles.equals(enemyTile)) {
                    this.currentPath = null;
                }
            }

            var inDirectSight = this.inDirectSightOf(this.currentTarget);
            if (!inDirectSight) {
                this.body.velocity.setTo(0);
            }

            inDirectSight = false;

            /*if (inDirectSight) {
                // We're in direct sight of the target, so charge at them.
                if (this.currentTween != null && this.currentTween.isRunning) {
                    this.currentTween.stop(false);
                }

                this.game.physics.arcade.moveToObject(this, this.currentTarget, this.speed);
                this.currentPath = null;
                this.currentDestination = null;
                this.direction = MovementHelper.getDirectionFromAngle(this.game.physics.arcade.angleBetween(this.position, this.currentTarget.position));
                this.updateAnimation();

                this.tilePosition = <Phaser.Point>map.fromPixels(this.position);
                if (!map.occupy(this.tilePosition.x, this.tilePosition.y, this)) {
                    this.body.velocity.setTo(0);
                    inDirectSight = false;
                }
            }*/

            if (!inDirectSight && (this.currentPath == null || this.currentPath.length === 0)) {
                // Find a path to the target.
                this.currentPath = map.findPath(this.tilePosition, targetPositionTiles);
            }

            if (this.currentPath != null && this.currentPath.length > 0) {
                this.moveToNextDestination();
            }
        }

        /**
         *  Attacks the target.
         */
        private attackTarget() {
            //this.action = Actions.Firing;
            this.body.velocity.setTo(0);
            this.face(this.currentTarget);
            this.updateAnimation();

            if (this.weapon.canFire) {
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
            this.currentPath = null;
            this.currentDestination = null;
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
         *  Checks if the target is in direct sight of us.
         */
        private inDirectSightOf(sprite: AnimatedSprite): boolean {
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

            var hits = CollisionHelper.raycast(lines);
            return hits.length === 0;
        }

        /**
         *  Handles moving from one tile to the next.
         */
        private moveToNextDestination(): void {
            if (this.moving || (this.currentTween != null && this.currentTween.isRunning)) {
                return;
            }

            var nextTile: Phaser.Point = null;
            if (this.currentDestination == null && this.currentPath != null && this.currentPath.length > 0) {
                nextTile = this.currentPath[0];
                this.currentDestination = <Phaser.Point>Game.CurrentMap.toPixels(nextTile);
                this.currentDestination.add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
            }

            if (nextTile == null) {
                this.currentDestination = null;
                return;
            }

            if (this.tilePosition.equals(nextTile)) {
                this.currentPath.splice(0, 1);
                this.currentDestination = null;
                return;
            }
            
            var angle = this.game.physics.arcade.angleBetween(this.tilePosition, nextTile);
            var direction = MovementHelper.getDirectionFromAngle(angle);

            var change = this.direction != direction;
            this.direction = direction;

            var map = Game.CurrentMap;
            if (!map.occupy(nextTile.x, nextTile.y, this)) {
                this.action = Actions.Standing;
                if (change) {
                    this.updateAnimation();
                }

                if (this.recheckPathStartTime > 0) {
                    this.recheckPathTime = this.game.time.now - this.recheckPathStartTime;
                    if (this.recheckPathTime > 100) {
                        this.currentPath = null;
                        this.currentDestination = null;
                    }
                }
                else {
                    this.recheckPathStartTime = this.game.time.now;
                }
                
                return;
            }

            this.recheckPathStartTime = 0;

            this.lastTilePosition = this.tilePosition = nextTile;

            this.currentPath.splice(0, 1);

            this.action = Actions.Moving;
            this.moving = true;

            var timeToMove = Phaser.Point.distance(this.position, this.currentDestination) / this.speed * 1000;
            this.currentTween = this.game.add.tween(this).to({ x: this.currentDestination.x, y: this.currentDestination.y }, timeToMove, Phaser.Easing.Linear.None, true, 0);
            this.currentTween.onComplete.addOnce(() => {
                this.moving = false;
                this.currentDestination = null;
            });

            this.updateAnimation();
        }
    }
}