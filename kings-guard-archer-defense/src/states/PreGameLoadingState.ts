// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class PreGameLoadingState extends Phaser.State {
        private map: GameMap;
        private ready: boolean;
        private sprites: {};

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
                'hero_spritesheet',
                'king',
            ];

            var total = spritesheets.length;
            var itemsToLoad = total;

            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === 'hero_spritesheet';

                var callback = (sprite: Hero) => {
                    this.sprites[sprite.key] = sprite;

                    --itemsToLoad;
                    if (itemsToLoad <= 0) {
                        this.ready = true;
                    }
                };

                AnimationLoader.load(name, callback, isHero ? Hero : AnimatedSprite);
            }
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