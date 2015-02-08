// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class AnimatedSprite extends Phaser.Sprite {
        public default_animation: string = 'face_down';

        constructor(game: Phaser.Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
        }

        init(): void {
            var animation = this.animations.getAnimation(this.default_animation);
            if (animation != null) {
                this.animations.play(this.default_animation);
            }

            this.game.physics.arcade.enable(this);
            this.game.world.add(this);
        }

        update(): void {
            super.update();

            
        }
    }
}