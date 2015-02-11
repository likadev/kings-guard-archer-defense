// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class EnemySpecification {
        constructor(public key: string, public movementSpeed: number, public health: number, public armor: number = 0) {

        }
    }
}