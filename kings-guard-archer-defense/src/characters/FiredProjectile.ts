// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.


module KGAD {
    export class FiredProjectile extends AnimatedSprite {
        public weapon: Weapon;
        public firedBy: AnimatedSprite;
        public attachedTo: AnimatedSprite;
        public dead: boolean;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
            this.dead = false;
        }

        init(...args: any[]) {
            super.init(args);
            this.body.collideWorldBounds = false;
            this.body.immovable = false;
            this.body.angle = this.angle;

            this.weapon = args[0];
            this.firedBy = args[1];

            this.weapon.lastFireTime = this.game.time.now;

            this.direction = MovementHelper.getDirectionFromAngle(this.rotation);
            if (this.direction == Directions.Up || this.direction == Directions.Down) {
                var h = this.body.width;
                this.body.width = this.body.height;
                this.body.height = h;
            }
        }

        public get power(): number {
            return this.weapon.power;
        }

        public attachTo(who: AnimatedSprite): void {
            this.attachedTo = who;
            this.dead = true;
        }

        update(): void {
            if (this.attachedTo != null) {
                this.alpha = Math.min(this.alpha, this.attachedTo.alpha);
            }
        }
    }
}