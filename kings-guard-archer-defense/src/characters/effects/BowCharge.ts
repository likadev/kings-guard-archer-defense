// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../../sprites/AnimatedSprite.ts" />

module KGAD {
    export class BowCharge extends AnimatedSprite {
        constructor(game: Phaser.Game, x: number, y: number, key?: string, frame?: any) {
            super(game, x, y, key, frame);
        }

        public init(...args: any[]) {
            super.init(args);

            this.canOccupy = false;
            this.canOccupyTiles = false;

            AnimationLoader.addAnimationToSprite(this, this.key);
        }
    }
}