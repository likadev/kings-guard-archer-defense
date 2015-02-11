// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class WeaponSpecification {
        constructor(public key: string, public cooldown: number, public velocity: number) {

        }

        static fromJson(jsonData: any): WeaponSpecification[] {
            var results: Array<WeaponSpecification> = [];

            if (!jsonData.weapons) {
                throw new Error("Cannot parse: JSON data must contain 'weapons' block.");
            }

            return results;
        }
    }
} 