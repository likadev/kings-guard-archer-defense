// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class Weapon {
        private lastFire: number;
        private group: Phaser.Group;

        constructor(public game: Phaser.Game, public key: string, public cooldown: number, public projectileSpeed: number = 0, public power: number = 1, public aliveTime: number = 5000) {
            this.lastFire = 0;
        }

        preload(): void {
            if (this.game.cache.getImage(this.key) == null) {
                var url: string = 'assets/textures/weapons/' + this.key + '.png';
                this.game.load.image(this.key, url);
            }
        }

        public get canFire(): boolean {
            return this.game.time.now - this.lastFire > this.cooldown;
        }

        public set lastFireTime(time: number) {
            this.lastFire = time;
        }

        update(): void {
            this.game.physics.arcade.collide(this.group, Game.CurrentMap.collisionLayer);
        }
    }
}