﻿// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Hero extends AnimatedSprite {
        private keys: {};
        private fireKey: Array<Phaser.Key>;
        private canMove: boolean;
        private moveTowards: Directions;
        private nextAnimation: string;
        public weapon: Weapon;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.keys = {};
            this.canMove = true;
            this.moveTowards = null;

            var keyboard = game.input.keyboard;

            this.keys[Directions.Up] = [keyboard.addKey(Phaser.Keyboard.UP), keyboard.addKey(Phaser.Keyboard.W)];
            this.keys[Directions.Left] = [keyboard.addKey(Phaser.Keyboard.LEFT), keyboard.addKey(Phaser.Keyboard.A)];
            this.keys[Directions.Down] = [keyboard.addKey(Phaser.Keyboard.DOWN), keyboard.addKey(Phaser.Keyboard.S)];
            this.keys[Directions.Right] = [keyboard.addKey(Phaser.Keyboard.RIGHT), keyboard.addKey(Phaser.Keyboard.D)];

            this.fireKey = [keyboard.addKey(Phaser.Keyboard.Z), keyboard.addKey(Phaser.Keyboard.SPACEBAR)];
            this.weapon = new Weapon(game, 'basic_arrow', 250, 750);
            this.weapon.preload();
        }

        init(): void {
            super.init();

            this.body.immovable = false;

            var cancelMovementCallback = () => {
                this.cancelMovement();
            }

            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    var keys: Array<Phaser.Key> = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];

                        var dir = parseInt(direction, 10);

                        switch (dir) {
                            case Directions.Up:
                                key.onDown.add(() => { this.moveUp(); });
                                break;

                            case Directions.Left:
                                key.onDown.add(() => { this.moveLeft(); });
                                break;

                            case Directions.Down:
                                key.onDown.add(() => { this.moveDown(); });
                                break;

                            case Directions.Right:
                                key.onDown.add(() => { this.moveRight(); });
                                break;
                        }
                        key.onUp.add(cancelMovementCallback);
                    }
                }
            }

            this.fireKey.forEach((value) => {
                value.onDown.add(() => { this.fire(); });
            });

            this.weapon.create();
        }

        private fire() {
            this.weapon.fire(this.x, this.y, MovementHelper.getPointFromDirection(this.direction));
        }

        private handleMovement(direction: Directions) {
            this.moveTowards = direction;

            if (!this.canMove) {
                return;
            }

            this.direction = direction;
            this.action = Actions.Moving;
            this.nextAnimation = AnimationHelper.getCurrentAnimation(this);

            if (!MovementHelper.move(this, direction)) {
                this.action = Actions.Standing;
                this.nextAnimation = AnimationHelper.getCurrentAnimation(this);
            }

            this.play(this.nextAnimation);
        }

        private moveUp(): void {
            this.handleMovement(Directions.Up);
        }

        private moveLeft(): void {
            this.handleMovement(Directions.Left);
        }

        private moveDown(): void {
            this.handleMovement(Directions.Down);
        }

        private moveRight(): void {
            this.handleMovement(Directions.Right);
        }

        private cancelMovement(): void {
            for (var dir in this.keys) {
                if (this.keys.hasOwnProperty(dir)) {
                    var keys: Array<Phaser.Key> = this.keys[dir];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        if (keys[i].isDown) {
                            this.moveTowards = dir;
                            return;
                        }
                    }
                }
            }

            this.moveTowards = null;
            this.body.velocity.setTo(0, 0);
        }

        update(): void {
            super.update();

            this.weapon.update();
        }
    }
}