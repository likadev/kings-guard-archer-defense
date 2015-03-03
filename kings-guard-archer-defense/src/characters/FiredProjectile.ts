// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.


module KGAD {
    export class FiredProjectile extends AnimatedSprite {
        public weapon: Weapon;
        public firedBy: AnimatedSprite;
        public attachedTo: AnimatedSprite;
        public dead: boolean;
        public chargePower: number;
        public wallWasHit: boolean;
        public aliveTime: number;
        public hitWallPoint: Phaser.Point;
        private offsetPosition: Phaser.Point;
        private originalDirection: Directions;
        protected _deadSpriteKey: string;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
            this.dead = false;
            this.canOccupy = false;
        }

        init(...args: any[]) {
            super.init(args);
            this.body.collideWorldBounds = false;
            this.body.immovable = false;
            this.body.angle = this.angle;

            this.weapon = args[0];
            this.firedBy = args[1];
            this.chargePower = args[2];

            if (!this.chargePower) {
                this.chargePower = 0;
            }

            this.weapon.lastFireTime = this.game.time.now;

            //this.direction = MovementHelper.getDirectionFromAngle(this.rotation);
            if (this.direction == Directions.Up || this.direction == Directions.Down) {
                var h = this.body.width;
                this.body.width = this.body.height;
                this.body.height = h;
            }

            this.aliveTime = this.lifespan;
        }

        public get deadSpriteKey() {
            return this._deadSpriteKey;
        }

        public set deadSpriteKey(key: string) {
            this._deadSpriteKey = key;
        }

        public get power(): number {
            return Math.floor(this.weapon.power + 
                (this.weapon.power * this.chargePower));
        }

        public get speed(): number {
            return Math.floor(this.weapon.projectileSpeed +
                this.weapon.projectileSpeed * (this.chargePower / 4));
        }

        public get canOccupyTiles(): boolean {
            return false;
        }

        public attachTo(who: AnimatedSprite): void {
            this.wallWasHit = true;
            this.attachedTo = who;
            this.dead = true;
            if (this._deadSpriteKey) {
                this.loadTexture(this._deadSpriteKey, 0, false);
            }

            this.game.time.events.add(3000,() => {
                this.game.add.tween(this).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.addOnce(() => {
                    this.kill();
                });
            }, this);

            this.offsetPosition = Phaser.Point.subtract(this.attachedTo.position, this.position).divide(2, 2);
            this.originalDirection = who.direction;
        }

        public hitWall() {
            this.wallWasHit = true;
            this.dead = true;
            if (this._deadSpriteKey) {
                this.createDeadProjectile();
            }

            this.kill();
        }

        update(): void {
            if (!this.dead && this.aliveTime > 0) {
                this.aliveTime -= this.game.time.physicsElapsedMS;
                if (this.aliveTime <= 0) {
                    this.hitWall();
                }
            }

            if (this.attachedTo != null) {
                this.position = Phaser.Point.subtract(this.attachedTo.position, this.offsetPosition);
                if (this.attachedTo.direction != this.originalDirection) {
                    //var angle = MovementHelper.getRotationFromDirections(this.originalDirection, this.attachedTo.direction);
                    //this.rotation = angle;
                    //Phaser.Point.rotate(this.position, this.attachedTo.x, this.attachedTo.y, angle);
                    //this.rotation = -angle;
                }
                if (this.attachedTo.alpha < 1) {
                    this.alpha = Math.min(this.alpha, this.attachedTo.alpha);
                }
            }
        }

        private createDeadProjectile() {
            if (!this.deadSpriteKey) {
                return;
            }

            var pos = new Phaser.Point(this.x + Math.cos(angle) * 3, this.y + Math.sin(angle) * 3);
            if (this.hitWallPoint && this.wallWasHit) {
                pos = this.hitWallPoint;
            }

            var sprite = this.game.add.sprite(pos.x, pos.y, this.deadSpriteKey);
            (<any>sprite).renderPriorty = this.renderPriority - 1;
            sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            var angle = MovementHelper.getAngleFromDirection(this.direction);
            sprite.rotation = angle;
            sprite.anchor.set(1, 0.5);

            this.game.time.events.add(this.weapon.aliveTime,() => {
                this.game.add.tween(sprite).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
            }, this);
        }
    }
}