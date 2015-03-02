// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class BootState extends Phaser.State {
        init(): void {
            this.add.plugin((<any>Phaser.Plugin).Tiled);
        }

        preload(): void {
            
        }

        create(): void {
            this.input.maxPointers = 1;
            this.input.gamepad.start();
            this.game.physics.enable(Phaser.Physics.ARCADE);
            this.stage.disableVisibilityChange = true;
        }

        update(): void {
            var states = States.Instance;
            states.switchTo(States.MainMenu);
        }
    }
}