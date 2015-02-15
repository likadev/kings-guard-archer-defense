// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class King extends AnimatedSprite {
        private damageTween: Phaser.Tween;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.health = 20;
        }

        public get weight(): number {
            return 1;
        }

        public inflictDamage(amount: number, source: AnimatedSprite): AnimatedSprite {
            super.inflictDamage(amount, source);

            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
            }

            this.damageTween = AnimationHelper.createDamageTween(this);
            this.damageTween.start();

            return this;
        }
    }
}