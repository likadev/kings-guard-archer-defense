// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class PreGameLoadingState extends Phaser.State {
        private map: GameMap;
        private ready: boolean;
        private sprites: {};
        private chargeSprite: AnimatedSprite;

        constructor() {
            super();
        }

        init(args: Array<any>): void {
            this.map = args[0];
        }

        preload(): void {
            this.sprites = [];

            this.map.preload();

            var spritesheets = [
                Hero.KEY,
                'king',
                'enemy',
                'tank_merc',
            ];

            var total = spritesheets.length;
            var itemsToLoad = total;

            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === Hero.KEY;
                var isEnemy = name === 'enemy';
                var isKing = name === 'king';
                var isMerc = name === 'tank_merc';

                var callback = (sprite: AnimatedSprite) => {
                    this.sprites[sprite.key] = sprite;

                    --itemsToLoad;
                    if (itemsToLoad <= 0) {
                        this.ready = true;
                    }
                };

                AnimationLoader.load(name, callback, isHero ? Hero : isEnemy ? Enemy : isKing ? King : isMerc ? Mercenary : AnimatedSprite);
            }

            AnimationLoader.load('charge',(s: AnimatedSprite) => {
                this.chargeSprite = s;
            }, BowCharge, 'assets/textures/weapons/');
        }

        create(): void {
        }

        update(): void {
            var states = States.Instance;
            if (AnimationLoader.done && this.ready) {
                states.switchTo(States.GameSimulation, true, false, this.map, this.sprites);
            }
        }
    }
}