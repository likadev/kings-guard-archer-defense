// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Enemy extends AnimatedSprite {
        public enemyType: EnemySpecification;
        public weapon: Weapon;
        private attached: FiredProjectile[];

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
            this.attached = [];
        }

        init(...args: any[]) {
            super.init(args);

            if (args.length > 0) {
                this.enemyType = args[0];

                this.health = this.enemyType.health;
            }
        }

        public damage(amount: number): Phaser.Sprite {
            var willDie = false;
            if (this.health - amount <= 0) {
                willDie = true;
            }

            if (!willDie) {
                super.damage(amount);
            }
            else {
                this.health = 0;
                delete this.body;
            }

            if (this.health <= 0) {
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

            this.game.add.tween(this).to({ tint: 0xFF3333 }, 35, Phaser.Easing.Cubic.InOut, true, 0, 2, true);

            return this;
        }

        public attach(projectile: FiredProjectile) {
            this.attached.push(projectile);
            //projectile.attachTo(this);
        }

        update(): void {
            var toRemove = [];
            for (var i = 0, l = this.attached.length; i < l; ++i) {
                var item = this.attached[i];
                item.alpha = this.alpha;
                item.update();
                if (item.alpha == 0 || !item.exists) {
                    toRemove.push(item);
                }
            }

            for (i = 0, l = toRemove.length; i < l; ++i) {
                item = toRemove[i];
                var index = this.attached.indexOf(item);
                if (index >= 0) {
                    this.attached = this.attached.splice(index, 1);
                }
            }
        }
    }
}