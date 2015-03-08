// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="./Actions.ts" />

module KGAD {
    export class AnimationHelper {
        /**
         *  Gets an animation based on a sprite's action and direction.
         */
        public static getAnimationFromAction(action: Actions, direction: Directions): string {
            var dir = parseInt(<any>direction, 10);
            var dirName = null;

            switch (dir) {
                case Directions.Up:
                    dirName = "up";
                    break;

                case Directions.Left:
                    dirName = "left";
                    break;

                case Directions.Down:
                    dirName = "down";
                    break;

                case Directions.Right:
                    dirName = "right";
                    break;
            }

            var animationName = action + (dirName != null ? "_" + dirName : "");
            return animationName;
        }

        /**
         *  Based on a sprite's action/direction, return the animation name.
         */
        public static getCurrentAnimation(sprite: AnimatedSprite): string {
            return AnimationHelper.getAnimationFromAction(sprite.action, sprite.direction);
        }

        /**
         *  Creates a tween that makes a sprite appear as if it's been damaged.
         */
        public static createDamageTween(obj: AnimatedSprite): Phaser.Tween {
            var game = Game.Instance;

            var tintValue = 0xFF3333;
            if (game.device.firefox && game.renderType === Phaser.CANVAS) {
                // Canvas tint rendering + Phaser 2.2.1 is broken
                tintValue = 0xFFFFFF;
            }

            var tween = game.add.tween(obj).to({ tint: tintValue }, 35, Phaser.Easing.Cubic.InOut, false, 0, 2, true);
            obj.tint = 0xFFFFFF;
            return tween;
        }

        public static createTextPopup(text: string, fadeInDelay: number = 300, fadeOutDelay = 3000, onComplete?: () => any) {
            var game = Game.Instance;

            var y = 125;

            var shadowProps = {
                centeredX: true,
                y: y + 1,
                fixedToCamera: true,
                style: {
                    font: '36px MedievalSharpBook',
                    fill: '#000000'
                }
            };

            var shadowText = Text.createText(text, shadowProps);
            var shadowText2 = Text.createText(text, shadowProps);
            shadowText.alpha = 0;
            shadowText2.alpha = 0;

            var headerText = Text.createText(text, {
                centeredX: true,
                y: y,
                fixedToCamera: true,
                style: {
                    font: '36px MedievalSharpBook'
                }
            });
            headerText.alpha = 0;

            shadowText.preUpdate = function() {
                shadowText.x = headerText.x - 1;
                shadowText.y = headerText.y - 1;
                shadowText2.x = headerText.x + 1;
                shadowText2.y = headerText.y + 1;
                shadowText.alpha = headerText.alpha;
                shadowText2.alpha = headerText.alpha;
            };

            game.world.add(shadowText);
            game.world.add(shadowText2);
            game.world.add(headerText);

            var fadeIn = game.add.tween(headerText).to({ y: 70, alpha: 1 }, fadeInDelay, Phaser.Easing.Linear.None, false, 0);
            var flash = game.add.tween(headerText).to({ tint: 0xFF00FF }, 100, <any>Phaser.Easing.Cubic.InOut, true, 0, 0, true);
            fadeIn.onComplete.addOnce(() => {
                var fadeOut = game.add.tween(headerText).to({ y: 75, alpha: 0 }, fadeInDelay, Phaser.Easing.Linear.None, false, fadeOutDelay);
                if (onComplete) {
                    fadeOut.onComplete.addOnce(onComplete);
                }
                fadeOut.start();
            });
            fadeIn.start();
        }

        public static createTextSubPopup(text: string, fadeInDelay: number = 300, fadeOutDelay = 3000, onComplete?: () => any) {
            var game = Game.Instance;

            var y = 165;

            var shadowText = Text.createText(text, {
                centeredX: true,
                y: y + 1,
                fixedToCamera: true,
                style: {
                    font: '24px MedievalSharpBook',
                    fill: '#000000'
                }
            });
            shadowText.alpha = 0;

            var headerText = Text.createText(text, {
                centeredX: true,
                y: y,
                fixedToCamera: true,
                style: {
                    font: '24px MedievalSharpBook',
                    fill: '#EEEEEE'
                }
            });
            headerText.alpha = 0;

            shadowText.preUpdate = function () {
                shadowText.x = headerText.x - 1;
                shadowText.y = headerText.y - 1;
                shadowText.alpha = headerText.alpha;
            };

            game.world.add(shadowText);
            game.world.add(headerText);

            var fadeIn = game.add.tween(headerText).to({ y: 70, alpha: 1 }, fadeInDelay, Phaser.Easing.Linear.None, false, 0);
            fadeIn.onComplete.addOnce(() => {
                var fadeOut = game.add.tween(headerText).to({ y: 75, alpha: 0 }, fadeInDelay, Phaser.Easing.Linear.None, false, fadeOutDelay);
                if (onComplete) {
                    fadeOut.onComplete.addOnce(onComplete);
                }
                fadeOut.start();
            });
            fadeIn.start();
        }
    }
} 