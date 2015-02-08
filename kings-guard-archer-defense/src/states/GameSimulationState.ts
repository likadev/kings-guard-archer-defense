// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameSimulationState extends Phaser.State {
        private map: GameMap;
        private sprites: {};
        private hero: AnimatedSprite;
        private king: AnimatedSprite;

        constructor() {
            super();
        }

        init(args: any[]) {
            this.map = args[0];
            this.sprites = args[1];

            this.hero = this.sprites['hero_spritesheet'];
            this.king = this.sprites['king'];
        }

        preload(): void {
        }

        create(): void {
            this.map.create();

            var heroPos = <Phaser.Point>this.map.toPixels(this.map.heroSpawnPoint);
            var kingPos = <Phaser.Point>this.map.toPixels(this.map.kingSpawnPoint);

            this.hero.position.set(heroPos.x, heroPos.y);
            this.king.position.set(kingPos.x, kingPos.y);

            for (var spriteKey in this.sprites) {
                if (this.sprites.hasOwnProperty(spriteKey)) {
                    var sprite = this.sprites[spriteKey];
                    if (typeof sprite.init === 'function') {
                        sprite.init();
                    }
                }
            }
        }

        update(): void {
            this.game.physics.arcade.collide(this.hero, this.map.collisionLayer);

            
        }
    }
}