// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class MainMenuState extends Phaser.State {
        private map: GameMap;
        private script: ScriptEngine;

        constructor() {
            super();
        }

        preload(): void {
            var firstLevel = "level_1";
            this.map = new GameMap(firstLevel);
            this.script = new ScriptEngine(firstLevel);
            this.script.preload();
            Game.CurrentMap = this.map;
        }

        create(): void {
            this.script.create();
        }

        update(): void {
            if (this.map.ready) {
                var states = States.Instance;
                states.switchTo(States.PreGameLoading, true, false, this.map, this.script);
            }
        }
    }
}