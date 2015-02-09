// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../definitions/phaser.d.ts" />
/// <reference path="states/States.ts" />

module KGAD {
    export class Game extends Phaser.Game {
        private static instance: Game = null;
        private static currentMap: GameMap = null;

        public static get Instance(): Game {
            return Game.instance;
        }

        public static get CurrentMap(): GameMap {
            return Game.currentMap;
        }

        public static set CurrentMap(map: GameMap) {
            this.currentMap = map;
        }

        constructor(width: number, height: number, container: string) {
            super(width, height, Phaser.AUTO, container);

            if (Game.instance != null) {
                throw Error('Cannot create more than one \'Game\' instance!');
            }

            Game.instance = this;

            var states = new States();
            states.setUpStates();
            states.switchTo(States.Boot);
        }
    }
}

window.onload = () => {
    try {
        $('#content').html('');
        var game = new KGAD.Game(640, 640, 'content');
    }
    finally {

    }
};