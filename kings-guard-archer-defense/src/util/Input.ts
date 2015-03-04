// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    /**
     *  Static helper utilities for input.
     */
    export class Input {
        /**
         *  Disables player input on the given Hero object.
         */
        public static disablePlayerInput(hero: Hero): Hero {
            var doNothing = function() { };

            hero['moving'] = false;
            hero['disableInput'] = true;
            hero.action = Actions.Standing;
            hero.weapon.cancelCharging();
            hero.updateAnimation();

            return hero;
        }

        /**
         *  Enables player input on the given Hero object.
         */
        public static enablePlayerInput(hero: Hero): Hero {
            hero['disableInput'] = false;

            return hero;
        }
    }
}