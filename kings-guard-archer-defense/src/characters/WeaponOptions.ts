// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export interface WeaponOptions {
        /** How long (in milliseconds) to wait until a weapon can fire again. */
        cooldown?: number;

        /** How long (in milliseconds) to wait after the fire button is pressed before the weapon fires. */
        frontSwing?: number;

        /** How long (in milliseconds) to wait after a weapon has fired before the weapon user can move. */
        backSwing?: number;

        /** The sprite used for charging animations. */
        chargeSprite?: AnimatedSprite;

        /** The range (in pixels) that this weapon can reach. */
        range?: number;

        /** The texture key used to replace the projectile after it's been killed. */
        deadProjectileKey?: string;

        /** The minimum amount of time (in milliseconds) that a weapon is charging before it gains a power/speed benefit. */
        chargeTime?: number;

        /** The maximum amount of time (in milliseconds) the weapon must be charged before it reaches full power. */
        fullChargeTime?: number;

        /** The speed (in pixels/sec) at which a projectile travels. */
        projectileSpeed?: number;

        /** The amount of damage that the weapon inflicts (before armor reduction) to a player's health. */
        power?: number;

        /** The amount of time that projectiles live after being fired. */
        aliveTime?: number;
    }
}