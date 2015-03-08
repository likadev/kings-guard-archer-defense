// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export interface MercenaryType {
        key: string;

        cost: number;

        ranged: boolean;

        baseHealth: number;

        baseArmor: number;

        canMove: boolean;

        canPerch: boolean;

        engageRange: number;

        movementSpeed: number;

        weapon: {
            key: string;
            range: number
            basePower: number;
            frontSwing: number;
            backSwing: number;
            cooldown: number;
            projectileSpeed: number;
        };
    }
}