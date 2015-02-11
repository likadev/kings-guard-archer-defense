// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameInfo {
        private static instance: GameInfo;
        public projectiles: ProjectileManager;

        constructor(public king: AnimatedSprite, public hero: Hero) {
            this.projectiles = new ProjectileManager();
        }

        static get CurrentGame(): GameInfo {
            return this.instance;
        }

        static set CurrentGame(info: GameInfo) {
            this.instance = info;
        }

        static create(king: AnimatedSprite, hero: Hero) {
            GameInfo.CurrentGame = new GameInfo(king, hero);
        }
    }
}