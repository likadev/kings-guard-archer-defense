// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Hero extends AnimatedSprite {
        private keys: {};
        private movementKeyState: { up: boolean; right: boolean; left: boolean; down: boolean; };
        private fireKey: Array<Phaser.Key>;
        private canMove: boolean;
        private chargeDirection: Directions;
        private nextAnimation: string;
        private movementSpeed: number;
        private moving: boolean;
        private lastChargingState: boolean;
        private movementTween: Phaser.Tween;
        private damageTween: Phaser.Tween;
        private nextTile: Phaser.Point;
        private lastTile: Phaser.Point;
        public weapon: Weapon;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.keys = {};
            this.movementKeyState = {
                up: false,
                left: false,
                right: false,
                down: false
            };
            this.canMove = true;

            var keyboard = game.input.keyboard;

            this.keys[Directions.Up] = [keyboard.addKey(Phaser.Keyboard.UP), keyboard.addKey(Phaser.Keyboard.W)];
            this.keys[Directions.Left] = [keyboard.addKey(Phaser.Keyboard.LEFT), keyboard.addKey(Phaser.Keyboard.A)];
            this.keys[Directions.Down] = [keyboard.addKey(Phaser.Keyboard.DOWN), keyboard.addKey(Phaser.Keyboard.S)];
            this.keys[Directions.Right] = [keyboard.addKey(Phaser.Keyboard.RIGHT), keyboard.addKey(Phaser.Keyboard.D)];

            this.fireKey = [keyboard.addKey(Phaser.Keyboard.Z), keyboard.addKey(Phaser.Keyboard.SPACEBAR)];
            this.weapon = new Weapon(game, 'basic_arrow', 250, 750);
            this.weapon.preload();

            this.movementSpeed = 200;
            this.health = 5;
            this.moving = false;
            this.chargeDirection = null;
        }

        public get weight(): number {
            if (this.moving) {
                return 5;
            }

            return 0;
        }

        init(): void {
            super.init();

            this.body.immovable = true;
            this.lastTile = <Phaser.Point>Game.CurrentMap.fromPixels(this.position);

            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    var keys: Array<Phaser.Key> = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];

                        var dir = parseInt(direction, 10);

                        switch (dir) {
                            case Directions.Up:
                                key.onDown.add(() => { this.setMovementState(Directions.Up, true); });
                                key.onUp.add(() => { this.setMovementState(Directions.Up, false); });
                                break;

                            case Directions.Left:
                                key.onDown.add(() => { this.setMovementState(Directions.Left, true); });
                                key.onUp.add(() => { this.setMovementState(Directions.Left, false); });
                                break;

                            case Directions.Down:
                                key.onDown.add(() => { this.setMovementState(Directions.Down, true); });
                                key.onUp.add(() => { this.setMovementState(Directions.Down, false); });
                                break;

                            case Directions.Right:
                                key.onDown.add(() => { this.setMovementState(Directions.Right, true); });
                                key.onUp.add(() => { this.setMovementState(Directions.Right, false); });
                                break;
                        }
                    }
                }
            }

            this.fireKey.forEach((value) => {
                value.onDown.add(() => {
                    this.fireKeyDown();
                });

                value.onUp.add(() => {
                    this.fireKeyUp();
                });
            });
        }

        /**
         *  Checks if a directional key is pressed immediately.
         */
        private isDown(dir: Directions) {
            var result: boolean = false;

            var keys: Phaser.Key[] = this.keys[dir];
            for (var i = 0, l = keys.length; i < l; ++i) {
                var key = keys[i];
                if (key.isDown) {
                    result = true;
                    break;
                }
            }

            return result;
        }

        private fireKeyDown() {
            this.weapon.startCharging();

            if (this.isDown(Directions.Up)) {
                this.chargeDirection = Directions.Up;
            }
            else if (this.isDown(Directions.Down)) {
                this.chargeDirection = Directions.Down;
            }
            else if (this.isDown(Directions.Left)) {
                this.chargeDirection = Directions.Left;
            }
            else if (this.isDown(Directions.Right)) {
                this.chargeDirection = Directions.Right;
            }
            else {
                this.chargeDirection = this.direction;
            }

            /*
            var currentDirection = MovementHelper.getNameOfDirection(this.direction);
            if (this.movementKeyState[currentDirection]) {
                this.chargeDirection = this.direction;
            }
            else {
                
            }*/
        }

        private fireKeyUp() {
            var chargePower = this.weapon.stopCharging();
            this.fire(chargePower);
        }

        private fire(chargePower: number) {
            var projectiles = GameInfo.CurrentGame.projectiles;

            if (this.weapon.canFire) {
                this.chargeDirection = null;
                projectiles.fire(this.x, this.y, this, this.weapon, chargePower);

                if (this.movementTween != null && this.movementTween.isRunning) {
                    // The player released a shot mid-tween.
                    // Stop the current tween and start a new one so that they can finish tweening at a faster speed.
                    var nextTilePosition = (<Phaser.Point>Game.CurrentMap.toPixels(this.nextTile)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
                    var remainingDistance = Phaser.Point.distance(this.position, nextTilePosition);
                    if (remainingDistance > 0.0001) {
                        this.movementTween.stop(false);
                        var timeToMove = Math.min(this.movementSpeed * (remainingDistance / GameMap.TILE_WIDTH), this.movementSpeed);
                        this.moveToNextTile(timeToMove);
                    }
                    else {
                        this.movementTween.stop(true);
                    }
                }
            }
        }

        /**
         *  Handle moving in the given direction.
         */
        private handleMovement(direction: Directions) {
            if ((this.movementTween != null && this.movementTween.isRunning) || !this.canMove) {
                return;
            }

            var nextTile: Phaser.Point = Phaser.Point.add(this.tilePosition, MovementHelper.getPointFromDirection(direction));

            if (this.weapon.isCharging() && this.chargeDirection != null) {
                this.direction = this.chargeDirection;
            }
            else {
                this.direction = direction;
            }

            var map = Game.CurrentMap;
            if (!map.occupy(nextTile.x, nextTile.y, this)) {
                this.moving = false;
                this.canMove = true;
                this.action = Actions.Standing;
                this.updateAnimation();
                return;
            }

            var timeToMove = this.weapon.isCharging() ? this.movementSpeed * 2 : this.movementSpeed;
            this.tilePosition = nextTile;
            this.canMove = false;
            this.moving = true;
            this.action = Actions.Moving;
            this.nextTile = nextTile;

            this.moveToNextTile(timeToMove);
        }

        /**
         *  Move to the next tile.
         */
        private moveToNextTile(speed: number) {
            var nextPosition: Phaser.Point = <Phaser.Point>Game.CurrentMap.toPixels(this.nextTile);

            this.movementTween = this.game.add.tween(this);
            this.movementTween.to({ x: nextPosition.x + GameMap.TILE_WIDTH / 2, y: nextPosition.y + GameMap.TILE_HEIGHT / 2 }, speed, Phaser.Easing.Linear.None, false, 0);
            this.movementTween.onComplete.addOnce(() => {
                this.canMove = true;
                this.lastTile = this.nextTile;
                this.updateMovementState();
            });
            this.movementTween.start();

            this.updateAnimation();
        }

        /**
         *  Sets the state of the hero's movement.
         */
        private setMovementState(direction: Directions, isMoving: boolean): void {
            var directionName = MovementHelper.getNameOfDirection(direction);
            this.movementKeyState[directionName] = isMoving;

            if (isMoving) {
                this.handleMovement(direction);
            }
            else {
                this.updateMovementState();
            }
        }

        /**
         *  Update's the player's movement state based on what keys are pressed.
         */
        private updateMovementState(): void {
            var states = this.movementKeyState;
            var direction: Directions = null;
            if (states.up) {
                direction = Directions.Up;
            }
            else if (states.down) {
                direction = Directions.Down;
            }
            else if (states.left) {
                direction = Directions.Left;
            }
            else if (states.right) {
                direction = Directions.Right;
            }

            if (direction != null) {
                this.handleMovement(direction);
            }
            else {
                this.moving = false;
                this.canMove = true;
                this.action = Actions.Standing;

                if (this.weapon.isCharging() && this.chargeDirection != null) {
                    this.direction = this.chargeDirection;
                }

                this.updateAnimation();
            }
        }

        public inflictDamage(amount: number, source: AnimatedSprite): AnimatedSprite {
            super.inflictDamage(amount, source);

            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
            }

            this.damageTween = AnimationHelper.createDamageTween(this);
            this.damageTween.start();

            return this;
        }

        update(): void {
            super.update();

            if (this.moving) {
                if (this.lastChargingState !== this.weapon.isCharging()) {
                    this.chargeDirection = this.direction;
                    this.lastChargingState = this.weapon.isCharging();
                    //this.handleMovement(this.direction);
                }
            }

            this.weapon.update(this);
        }

        render(): void {
            super.render();
        }
    }
}