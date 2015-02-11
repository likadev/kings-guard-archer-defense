﻿// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
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
    }
} 