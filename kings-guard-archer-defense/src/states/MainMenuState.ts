// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class MainMenuState extends Phaser.State {
        private map: GameMap;

        constructor() {
            super();
        }

        preload(): void {
            this.map = new GameMap("level_1");
            Game.CurrentMap = this.map;
        }

        create(): void {
        }

        update(): void {
            if (this.map.ready) {
                var states = States.Instance;
                states.switchTo(States.PreGameLoading, true, false, this.map);
            }
        }
    }
}