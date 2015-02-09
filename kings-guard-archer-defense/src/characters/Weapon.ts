// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class Weapon {
        private lastFire: number;
        private group: Phaser.Group;
        private static projectileGroups: { [group: string]: Phaser.Group; } = {};
        private static activeProjectiles: Array<Phaser.Sprite> = [];

        constructor(public game: Phaser.Game, public key: string, public cooldown: number, public projectileSpeed: number = 0) {
            this.lastFire = 0;
        }

        preload(): void {
            if (!Weapon.projectileGroups.hasOwnProperty(this.key)) {
                var url: string = 'assets/textures/weapons/' + this.key + '.png';
                this.game.load.image(this.key, url);
            }
        }

        create(): void {
            var group = Weapon.projectileGroups[this.key];
            if (!Weapon.projectileGroups.hasOwnProperty(this.key)) {
                group = this.game.add.group();
                Weapon.projectileGroups[this.key] = group;
            }

            this.group = group;
        }

        public fire(x: number, y: number, direction: Phaser.Point): boolean {
            var now = this.game.time.now;
            if (this.canFire) {
                var sprite = <Phaser.Sprite>this.group.create(x, y, this.key);
                sprite.anchor.setTo(0.5);
                sprite.rotation = Phaser.Point.angle(direction, new Phaser.Point());
                this.game.physics.arcade.enable(sprite);
                this.game.physics.arcade.enableBody(sprite);
                this.game.physics.arcade.velocityFromAngle(sprite.angle, this.projectileSpeed, sprite.body.velocity);

                setTimeout(() => {
                    if (sprite.alive) {
                        this.game.add.tween(sprite).to({ alpha: 0 }, 250).start().onComplete.addOnce(() => {
                            sprite.kill();
                            Weapon.activeProjectiles = Weapon.activeProjectiles.splice(Weapon.activeProjectiles.indexOf(sprite), 1);
                        });
                    }
                }, 5000);

                Weapon.activeProjectiles.push(sprite);

                this.lastFire = now;
                return true;
            }

            return false;
        }

        public get canFire(): boolean {
            return this.game.time.now - this.lastFire > this.cooldown;
        }

        update(): void {
            this.game.physics.arcade.collide(this.group, Game.CurrentMap.collisionLayer);
        }
    }
}