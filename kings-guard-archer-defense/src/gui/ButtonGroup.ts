// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class ButtonGroup extends Phaser.Group {
        private _spacing: number;
        private _margin: number;
        private keyboardNavigationEnabled: boolean;
        private keys: { [key: number]: InputButton[] };
        private clickKeys: InputButton[];

        public buttons: collections.LinkedList<Button>;
        public clicked: Phaser.Signal;

        public get spacing(): number {
            return this.spacing;
        }

        public set spacing(spacing: number) {
            this.spacing = spacing;

            this.updatePosition();
        }

        public get margin(): number {
            return this.margin;
        }

        public set margin(margin: number) {
            this.margin = margin;

            this.updatePosition();
        }

        constructor(game: Phaser.Game, parent?: any, name?: string, addToStage?: boolean, enableBody?: boolean, physicsBodyType?: number) {
            super(game, parent, name, addToStage, enableBody, physicsBodyType);

            this.buttons = new collections.LinkedList<Button>();
            this.clicked = new Phaser.Signal();

            this.fixedToCamera = true;
            this.x = 0;
            this.y = 0;
            this.spacing = 0;
            this.margin = 0;
        }

        /**
         *  Add several buttons.
         */
        public addButtons(buttons: Button[]) {
            for (var i = 0, l = buttons.length; i < l; ++i) {
                this.addButton(buttons[i]);
            }
        }

        /**
         *  Adds a button to the button group.
         */
        public addButton(button: Button, index?: number) {
            this.addEventHandlers(button);
            this.buttons.add(button, index);
        }

        /**
         *  Removes a button from the button group.
         */
        public removeButton(button: Button|number) {
            var removed: Button;
            if (typeof button === 'number') {
                removed = this.buttons.removeElementAtIndex(button);
            }
            else {
                removed = this.buttons.remove(button) ? button : null;
            }

            if (removed) {
                this.removeEventHandlers(removed);
            }

            return removed;
        }

        /**
         *  Enable the player to navigate the button group using the keyboard and gamepad.
         */
        public enableKeyboardAndGamepadNavigation() {
            var kb = this.game.input.keyboard;
            var gp = this.game.input.gamepad;

            var pad = gp.padsConnected === 0 ? null :
                gp.pad1.connected ? gp.pad1 :
                    gp.pad2.connected ? gp.pad2 :
                        gp.pad3.connected ? gp.pad3 :
                            gp.pad4.connected ? gp.pad4 :
                                null;

            this.keys[Directions.Up] = [ kb.addKey(Phaser.Keyboard.UP), ];
            this.keys[Directions.Left] = [ kb.addKey(Phaser.Keyboard.LEFT), ];
            this.keys[Directions.Right] = [ kb.addKey(Phaser.Keyboard.RIGHT), ];
            this.keys[Directions.Down] = [kb.addKey(Phaser.Keyboard.DOWN), ];

            if (pad != null) {
                this.keys[Directions.Up].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_UP));
                this.keys[Directions.Down].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN));
                this.keys[Directions.Left].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT));
                this.keys[Directions.Right].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT));
            }
        }

        /**
         *  Disable the player to navigate the button group using the keyboard and gamepad.
         */
        public disableKeyboardAndGameplayNavigation() {
            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    var keyList = this.keys[direction];
                    for (var i = 0, l = keyList.length; i < l; ++i) {
                        var key = keyList[i];
                        if (key instanceof Phaser.Key) {
                            key.enabled = false;
                        }
                        else if (key instanceof Phaser.GamepadButton) {
                            key.destroy();
                        }
                    }
                }
            }

            this.keys = {};
        }

        /**
         *  Adds internal event handlers for the button.
         */
        private addEventHandlers(button: Button) {
            button.clicked.add(this.onButtonClicked, this);
        }

        /**
         *  Removes internal event handlers for the button.
         */
        private removeEventHandlers(button: Button) {
            button.clicked.remove(this.onButtonClicked, this);
        }

        /**
         *  Called when a button associated with this group is clicked.
         */
        private onButtonClicked(button: Button) {
            this.clicked.dispatch(button, this);
        }

        /**
         *  Updates the position of each button in this button group.
         */
        public updatePosition() {
            var len = this.buttons.size();
            var x = this.cameraOffset.x + this.margin;
            var y = this.cameraOffset.y + this.margin;
            var startingX = x;
            var startingY = y;

            this.buttons.forEach((button: Button) => {
                button.x = x;
                button.y = y;

                y += button.height + this.spacing;

                return true;
            });
        }
    }
}
