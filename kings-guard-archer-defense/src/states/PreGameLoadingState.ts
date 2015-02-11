// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class PreGameLoadingState extends Phaser.State {
        private map: GameMap;
        private ready: boolean;
        private sprites: {};
        private enemyGenerator: EnemyGenerator;

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
                'enemy',
            ];

            var total = spritesheets.length;
            var itemsToLoad = total;

            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === 'hero_spritesheet';
                var isEnemy = name === 'enemy';

                var callback = (sprite: AnimatedSprite) => {
                    this.sprites[sprite.key] = sprite;

                    --itemsToLoad;
                    if (itemsToLoad <= 0) {
                        this.ready = true;
                    }
                };

                AnimationLoader.load(name, callback, isHero ? Hero : isEnemy ? Enemy : AnimatedSprite);
            }
        }

        create(): void {
            this.enemyGenerator = new EnemyGenerator();
            this.enemyGenerator.addType(new EnemySpecification("enemy", 64, 3, 0));
        }

        update(): void {
            var states = States.Instance;
            if (AnimationLoader.done && this.ready) {
                states.switchTo(States.GameSimulation, true, false, this.map, this.sprites, this.enemyGenerator);
            }
        }
    }
}