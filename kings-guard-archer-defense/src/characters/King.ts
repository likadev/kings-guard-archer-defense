// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class King extends AnimatedSprite {
        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.health = 25;
        }

        public init(...args: any[]) {
            super.init(args);

            this.hasHealthBar = true;
        }

        addToWorld() {
            super.addToWorld();

            this.hasShadow = true;
        }

        public get weight(): number {
            return 4;
        }
    }
}