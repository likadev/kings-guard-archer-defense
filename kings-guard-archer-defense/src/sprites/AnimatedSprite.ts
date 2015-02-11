// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../input/AnimationHelper.ts" />

module KGAD {
    export class AnimatedSprite extends Phaser.Sprite {
        public default_animation: string = 'face_down';
        public action: Actions;
        public direction: Directions;
        private added: boolean;

        constructor(game: Phaser.Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.anchor.setTo(0.5);
            this.action = Actions.Standing;
            this.direction = Directions.Down;
            this.added = false;
        }

        init(...args: any[]): void {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);

            //this.game.physics.arcade.enable(this);
            //this.game.physics.arcade.enableBody(this);
            this.body.collideWorldBounds = true;
            this.body.immovable = true;
        }

        public addToWorld(): void {
            if (!this.added) {
                this.default_animation = AnimationHelper.getCurrentAnimation(this);
                var animation = this.animations.getAnimation(this.default_animation);
                
                if (animation != null) {
                    this.animations.play(this.default_animation);
                }

                this.game.world.add(this);
                this.added = true;
            }
        }

        public updateAnimation(onComplete?: () => any): void {
            var animationName: string = AnimationHelper.getCurrentAnimation(this);
            console.log('switching ' + this.key + " to " + animationName);
            if (animationName != null) {
                var player = null;
                var animation = this.animations.getAnimation(animationName);
                if (animation != null) {
                    player = this.animations.play(animationName);
                }
                else {
                    this.action = Actions.Standing;
                    animationName = AnimationHelper.getCurrentAnimation(this);
                    animation = this.animations.getAnimation(animationName);
                    if (animation != null) {
                        player = this.animations.play(animationName);
                    }
                }

                if (onComplete) {
                    player.onComplete.addOnce(onComplete);
                }
            }
        }

        update(): void {
            super.update();

            
        }
    }
}