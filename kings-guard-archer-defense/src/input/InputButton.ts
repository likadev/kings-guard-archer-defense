// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export interface InputButton {
        onDown: Phaser.Signal;

        onUp: Phaser.Signal;

        isDown: boolean;

        isUp: boolean;
    }
}