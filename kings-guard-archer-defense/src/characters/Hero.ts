// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Hero extends AnimatedSprite {
        public static KEY = "hero";

        private keys: { [direction: number]: InputButton[] };
        private movementKeyState: { up: boolean; right: boolean; left: boolean; down: boolean; };
        private fireKey: InputButton[];
        private canMove: boolean;
        private chargeDirection: Directions;
        private movingDirection: Directions;
        private nextAnimation: string;
        private moving: boolean;
        private lastChargingState: boolean;
        private nextTile: Phaser.Point;
        private lastTile: Phaser.Point;
        private inFiringMotion: boolean;
        private _disableInput: boolean;
        public weapon: Weapon;
        public pad: Phaser.SinglePad;
        public padIndex: number;

        constructor(game: Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.health = 5;
            this._disableInput = false;
        }

        private addGamepadButtons(): boolean {
            var gamepad = this.game.input.gamepad;
            gamepad.start();

            var lastLeftRightValue: any = false;
            var lastUpDownValue: any = false;

            gamepad.addCallbacks(this, {
                onConnect: this.onGamepadConnected,
                onDisconnect: this.onGamepadDisconnected
            });

            if (gamepad.padsConnected < 1) {
                return false;
            }

            this.onGamepadConnected();

            return true;
        }

        private onGamepadConnected() {
            /*var pad = this.getFirstConnectedPad();
            if (pad == null) {
                return false;
            }*/

            this.pad = this.getFirstConnectedPad();
            this.padIndex = this.pad ? this.pad.index : -1;

            if (!this.pad) {
                return false;
            }

            console.log('gamepad connected!');

            var buttons = [];
            buttons[Directions.Up] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_UP);
            buttons[Directions.Down] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN);
            buttons[Directions.Left] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT);
            buttons[Directions.Right] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT);

            for (var i = 0; i < buttons.length; ++i) {
                var button = buttons[i];
                if (button) {
                    this.keys[i].push(button);
                    this.addMovementHandler(button, i);
                }
            }

            var fireButton = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
            fireButton.onDown.add(() => {
                this.fireKeyDown();
            });

            fireButton.onUp.add(() => {
                this.fireKeyUp();
            });
            this.fireKey.push(fireButton);
        }

        private onGamepadDisconnected(pad, idx) {
            console.log('gamepad disconnected!');

            if (this.padIndex === idx) {
                this.pad = null;
                this.padIndex = -1;
            }

            var removeList: InputButton[] = [];

            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    removeList = [];

                    var keys: InputButton[] = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key: InputButton = keys[i];
                        if (key instanceof Phaser.GamepadButton) {
                            removeList.push(key);
                        }
                    }

                    Arrays.removeAll(removeList, keys);
                }
            }

            removeList = [];
            for (var j = 0, m = this.fireKey.length; j < m; ++j) {
                var button: InputButton = this.fireKey[j];
                if (button instanceof Phaser.GamepadButton) {
                    removeList.push(button);
                }
            }

            Arrays.removeAll(removeList, this.fireKey);
        }

        /**
         *  Gets the first gamepad that is connected.
         */
        private getFirstConnectedPad(): Phaser.SinglePad {
            var gamepad = this.game.input.gamepad;
            return gamepad.pad1.connected ? gamepad.pad1 :
                gamepad.pad2.connected ? gamepad.pad2 :
                    gamepad.pad3.connected ? gamepad.pad3 :
                        gamepad.pad4.connected ? gamepad.pad4 :
                            null;
        }

        public get disableInput(): boolean {
            return this._disableInput;
        }

        public set disableInput(disable: boolean) {
            this.movementKeyState.up = false;
            this.movementKeyState.left = false;
            this.movementKeyState.right = false;
            this.movementKeyState.down = false;
            this._disableInput = disable;
        }

        public get weight(): number {
            if (this.moving) {
                return 1;
            }

            return 2;
        }

        init(...args: any[]): void {
            super.init(args);

            this.hasHealthBar = true;

            this.keys = {};
            this.movementKeyState = {
                up: false,
                left: false,
                right: false,
                down: false
            };
            this.canMove = true;
            this.inFiringMotion = false;

            var keyboard = this.game.input.keyboard;

            this.keys[Directions.Up] = [keyboard.addKey(Phaser.Keyboard.UP), keyboard.addKey(Phaser.Keyboard.W)];
            this.keys[Directions.Left] = [keyboard.addKey(Phaser.Keyboard.LEFT), keyboard.addKey(Phaser.Keyboard.A)];
            this.keys[Directions.Down] = [keyboard.addKey(Phaser.Keyboard.DOWN), keyboard.addKey(Phaser.Keyboard.S)];
            this.keys[Directions.Right] = [keyboard.addKey(Phaser.Keyboard.RIGHT), keyboard.addKey(Phaser.Keyboard.D)];

            this.fireKey = [keyboard.addKey(Phaser.Keyboard.Z), keyboard.addKey(Phaser.Keyboard.Y), keyboard.addKey(Phaser.Keyboard.SPACEBAR)];

            this.addGamepadButtons();

            this.weapon = new Weapon(this.game, 'basic_arrow', {
                cooldown: 400,
                frontSwing: 240,
                range: 5000,
                aliveTime: 5000,
                power: 1,
                projectileSpeed: 750,
                chargeTime: 240,
                fullChargeTime: 1000,
                deadProjectileKey: 'basic_arrow_dead',
            });

            this.weapon.preload();

            this.movementSpeed = 150;
            this.health = 5;
            this.moving = false;
            this.chargeDirection = null;
            this.movingDirection = null;

            this.weapon.chargeSprite = new BowCharge(this.game, 0, 0, 'charge');
            this.weapon.chargeSprite.init();

            this.body.immovable = true;
            this.lastTile = <Phaser.Point>Game.CurrentMap.fromPixels(this.position);

            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    console.log('direction: ' + MovementHelper.getNameOfDirection(direction));
                    var keys: InputButton[] = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];

                        this.addMovementHandler(key, direction);
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

        private addMovementHandler(input: InputButton, direction: Directions) {
            input.onDown.add(() => {
                this.setMovementState(direction, true);
            });

            input.onUp.add(() => {
                this.setMovementState(direction, false);
            });
        }

        /**
         *  Checks if a directional key is pressed immediately.
         */
        private isDown(dir: Directions) {
            var result: boolean = false;

            var keys: InputButton[] = this.keys[dir];
            for (var i = 0, l = keys.length; i < l; ++i) {
                var key = keys[i];
                if (key.isDown) {
                    result = true;
                    break;
                }
            }

            if (!result && this.padIndex >= 0 && this.game.device.firefox) {
                // Firefox uses axis codes 5 (left/right) and 6 (up/down) for d-pad movement.
                var LEFT_RIGHT_AXIS = 5;
                var UP_DOWN_AXIS = 6;
                var value: any = false;
                if (dir === Directions.Left || dir === Directions.Right) {
                    value = this.pad.axis(LEFT_RIGHT_AXIS);

                    if ((value === 1 && dir === Directions.Right) || (value === -1 && dir === Directions.Left)) {
                        result = true;
                    }
                }
                else if (dir === Directions.Up || dir === Directions.Down) {
                    value = this.pad.axis(UP_DOWN_AXIS);

                    if ((value === 1 && dir === Directions.Down) || (value === -1 && dir === Directions.Up)) {
                        result = true;
                    }
                }
            }

            return result;
        }

        private checkGamepadDpadForFirefox() {
            if (this.game.device.firefox && this.pad) {
                var LEFT_RIGHT_AXIS = 5;
                var UP_DOWN_AXIS = 6;

                var value = this.pad.axis(LEFT_RIGHT_AXIS);
                if (value === 1) {
                    this.movementKeyState.left = false;
                    this.movementKeyState.right = true;
                }
                else if (value === -1) {
                    this.movementKeyState.left = true;
                    this.movementKeyState.right = false;
                }
                else {
                    this.movementKeyState.left = false;
                    this.movementKeyState.right = false;
                }

                value = this.pad.axis(UP_DOWN_AXIS);
                if (value === 1) {
                    this.movementKeyState.up = false;
                    this.movementKeyState.down = true;
                }
                else if (value === -1) {
                    this.movementKeyState.up = true;
                    this.movementKeyState.down = false;
                }
                else {
                    this.movementKeyState.up = false;
                    this.movementKeyState.down = false;
                }

                this.updateMovementState();
            }
        }

        private isFireKeyDown(): boolean {
            for (var i = 0, l = this.fireKey.length; i < l; ++i) {
                var key = this.fireKey[i];
                if (key.isDown) {
                    return true;
                }
            }

            return false;
        }

        private isFireKeyUp(): boolean {
            var isUp = true;

            for (var i = 0, l = this.fireKey.length; i < l; ++i) {
                var key = this.fireKey[i];
                if (key.isDown) {
                    isUp = false;
                    break;
                }
            }

            return isUp;
        }

        private fireKeyDown() {
            if (this.disableInput || !this.alive || !this.weapon.canFire || this.weapon.isFrontSwinging() || this.weapon.isBackSwinging()) {
                return;
            }

            this.inFiringMotion = true;
            this.action = Actions.Frontswinging;
            this.updateAnimation(() => {
                if (this.weapon.isCharging()) {
                    this.action = Actions.Charging;
                    this.updateAnimation();
                }
            });

            this.weapon.startFrontSwinging();
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

            this.updateMovementState();

            /*
            var currentDirection = MovementHelper.getNameOfDirection(this.direction);
            if (this.movementKeyState[currentDirection]) {
                this.chargeDirection = this.direction;
            }
            else {
                
            }*/
        }

        private fireKeyUp() {
            if (this.disableInput || !this.alive || !this.weapon.canFire || !this.inFiringMotion || this.weapon.isFrontSwinging()) {
                return;
            }

            var chargePower = this.weapon.stopCharging();
            this.fire(chargePower);
        }

        private fire(chargePower: number) {
            if (!this.alive) {
                return;
            }

            var projectiles = Game.Projectiles;

            if (this.weapon.canFire) {
                this.action = Actions.Firing;
                this.updateAnimation(() => {
                    if (this.weapon.isBackSwinging()) {
                        this.action = Actions.Backswinging;
                        this.updateAnimation();
                    }
                });
                projectiles.fire(this.x, this.y, this, this.weapon, chargePower);
                this.inFiringMotion = false;

                /*if (this.movementTween != null && this.movementTween.isRunning) {
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
                }*/

                if (!this.moving) {
                    this.chargeDirection = null;
                }

                this.updateMovementState();
                this.chargeDirection = null;
            }
        }

        /**
         *  Handle moving in the given direction.
         */
        private handleMovement(direction: Directions) {
            if (this.disableInput || /*(this.movementTween != null && this.movementTween.isRunning) || */!this.canMove) {
                return;
            }

            if (!this.alive) {
                return;
            }

            //var nextTile: Phaser.Point = Phaser.Point.add(this.tilePosition, MovementHelper.getPointFromDirection(direction));

            if (this.inFiringMotion && this.chargeDirection != null) {
                this.direction = this.chargeDirection;
            }
            else {
                this.direction = direction;
            }

            this.movingDirection = direction;

            var map = Game.CurrentMap;
            /*if (!map.occupy(nextTile.x, nextTile.y, this)) {
                this.moving = false;
                this.canMove = true;
                this.action = Actions.Standing;
                this.body.velocity.setTo(0);
                this.updateAnimation();
                return;
            }

            this.tilePosition = nextTile;
            this.canMove = false;
            this.moving = true;
            this.action = Actions.Moving;
            this.nextTile = nextTile;*/

            this.moving = true;

            var speed = this.weapon.isCharging() ? this.movementSpeed / 3 : this.movementSpeed;

            this.updateCurrentAction();

            this.updateAnimation();
            //MovementHelper.move(this, direction, speed);

            //var timeToMove = this.weapon.isCharging() ? this.movementSpeed * 2 : this.movementSpeed;
            //this.moveToNextTile(timeToMove);
        }

        private updateCurrentAction() {
            if (!this.inFiringMotion) {
                if (this.moving) {
                    this.action = Actions.Moving;
                }
                else {
                    this.action = Actions.Standing;
                }
            }
            else {
                if (this.weapon.isFrontSwinging()) {
                    this.action = Actions.Frontswinging;
                }
                else if (this.weapon.isBackSwinging()) {
                    this.action = Actions.Backswinging;
                }
                else if (this.weapon.isCharging()) {
                    if (this.moving) {
                        this.action = Actions.ChargeWalking;
                    }
                    else {
                        this.action = Actions.Charging;
                    }
                }
            }

            this.updateAnimation();
        }

        /**
         *  Move to the next tile.
         */
        /*private moveToNextTile(speed: number) {
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
        }*/

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
            if (this.disableInput) {
                return;
            }

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

            var currentDirection = this.direction;
            var curDirName = MovementHelper.getNameOfDirection(currentDirection);
            if (states[curDirName] === true) {
                direction = this.direction;
            }

            this.movingDirection = direction;

            if (direction != null) {
                this.handleMovement(direction);
            }
            else {
                this.moving = false;
                this.canMove = true;
                if (!this.inFiringMotion) {
                    this.action = Actions.Standing;
                }

                if (this.chargeDirection != null) {
                    this.direction = this.chargeDirection;
                }

                this.updateAnimation();
            }
        }

        public inflictDamage(amount: number, source: AnimatedSprite): AnimatedSprite {
            super.inflictDamage(amount, source);

            if (this.health <= 0) {
                if (this.weapon.chargeSprite) {
                    this.weapon.chargeSprite.visible = false;
                }
            }

            return this;
        }

        protected showDeathAnimation() {
            if (this.weapon.chargeSprite) {
                this.weapon.chargeSprite.visible = false;
            }

            super.showDeathAnimation(() => {

            });
        }

        preUpdate(): void {
            if (this.moving) {
                if (this.lastChargingState !== this.weapon.isCharging()) {
                    this.lastChargingState = this.weapon.isCharging();
                }

                var angle = MovementHelper.getAngleFromDirection(this.movingDirection);
                var deltaTime = this.game.time.physicsElapsed;
                var movementSpeed = this.weapon.isCharging() ? this.movementSpeed / 2.5 : this.movementSpeed;
                var x = Math.cos(angle) * deltaTime * movementSpeed;
                var y = Math.sin(angle) * deltaTime * movementSpeed;

                var nextPosition = new Phaser.Point(this.x + x, this.y + y);
                if (OccupiedGrid.canOccupyInPixels(this, nextPosition)) {
                    this.position.set(nextPosition.x, nextPosition.y);
                }
            }

            super.preUpdate();
        }

        update(): void {
            super.update();

            if (!this.disableInput) {
                this.checkGamepadDpadForFirefox();

                if (!this.inFiringMotion) {
                    if (this.isFireKeyDown()) {
                        this.fireKeyDown();
                    }
                }
                else {
                    if (this.isFireKeyUp()) {
                        this.fireKeyUp();
                    }
                }
            }

            this.updateCurrentAction();

            this.weapon.update(this);
        }

        render(): void {
            super.render();
        }
    }
}