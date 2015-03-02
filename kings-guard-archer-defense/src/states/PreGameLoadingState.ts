// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class PreGameLoadingState extends Phaser.State {
        private map: GameMap;
        private script: ScriptEngine;
        private ready: boolean;
        private sprites: {};
        private chargeSprite: AnimatedSprite;
        private skillChallengeMode: boolean;

        constructor() {
            super();
        }

        init(args: Array<any>): void {
            this.map = args[0];
            this.script = args[1];
            this.skillChallengeMode = !!args[2];
        }

        preload(): void {
            this.sprites = [];

            this.map.preload();
            this.script.preload();

            var spritesheets = [
                Hero.KEY,
                'king',
                'tank_merc',
            ];

            var keys = this.script.getEnemyKeys();
            for (var j = 0, len = keys.length; j < len; ++j) {
                spritesheets.push(keys[j]);
            }

            var total = spritesheets.length;
            var itemsToLoad = total;

            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === Hero.KEY;
                var isKing = name === 'king';
                var isMerc = name === 'tank_merc';
                var isEnemy = !isKing && !isHero && !isMerc;

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

            this.game.load.image('basic_arrow', 'assets/textures/weapons/basic_arrow.png');
            this.game.load.image('basic_arrow_dead', 'assets/textures/weapons/basic_arrow_dead.png');
            this.game.load.image('black', 'assets/textures/misc/black.png');
        }

        create(): void {

        }

        update(): void {
            var states = States.Instance;
            if (AnimationLoader.done && this.ready) {
                var nextState = this.skillChallengeMode ? States.SkillChallengeIntro : States.GameSimulation;

                states.switchTo(nextState, true, false, this.map, this.script);
            }
        }
    }
}