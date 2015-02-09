// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../input/AnimationHelper.ts" />

module KGAD {
    export class AnimatedSprite extends Phaser.Sprite {
        public default_animation: string = 'face_down';
        public action: Actions;
        public direction: Directions;

        constructor(game: Phaser.Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.anchor.setTo(0.5);
            this.action = Actions.Standing;
            this.direction = Directions.Down;
        }

        init(): void {
            this.default_animation = AnimationHelper.getCurrentAnimation(this);
            var animation = this.animations.getAnimation(this.default_animation);
            if (animation != null) {
                this.animations.play(this.default_animation);
            }

            this.game.physics.arcade.enable(this);
            this.game.physics.arcade.enableBody(this);
            this.game.world.add(this);
            this.body.collideWorldBounds = true;
            this.body.immovable = true;
        }

        update(): void {
            super.update();

            
        }
    }
}