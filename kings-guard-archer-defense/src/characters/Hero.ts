// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />

module KGAD {
    export class Hero extends AnimatedSprite {
        private keys: {};

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.keys = {};

            var keyboard = game.input.keyboard;

            this.keys[Directions.Up] = [keyboard.addKey(Phaser.Keyboard.UP), keyboard.addKey(Phaser.Keyboard.W)];
            this.keys[Directions.Left] = [keyboard.addKey(Phaser.Keyboard.LEFT), keyboard.addKey(Phaser.Keyboard.A)];
            this.keys[Directions.Down] = [keyboard.addKey(Phaser.Keyboard.DOWN), keyboard.addKey(Phaser.Keyboard.S)];
            this.keys[Directions.Right] = [keyboard.addKey(Phaser.Keyboard.RIGHT), keyboard.addKey(Phaser.Keyboard.D)];
        }

        init(): void {
            super.init();

            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    var keys: Array<Phaser.Key> = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];

                        var dir = parseInt(direction, 10);

                        switch (dir) {
                            case Directions.Up:
                                key.onDown.add(this.moveForward);
                                break;

                            case Directions.Left:
                                key.onDown.add(this.moveLeft);
                                break;

                            case Directions.Down:
                                key.onDown.add(this.moveDown);
                                break;

                            case Directions.Right:
                                key.onDown.add(this.moveRight);
                                break;
                        }
                    }
                }
            }
        }

        private moveForward(): void {
            console.log('forward');
        }

        private moveLeft(): void {
            console.log('left');
        }

        private moveDown(): void {
            console.log('down');
        }

        private moveRight(): void {
            console.log('right');
        }
    }
}