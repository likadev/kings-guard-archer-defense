// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class Button {
        private game: Game;
        public button: Phaser.Button;
        public position: Phaser.Point;
        public width: number;
        public height: number;
        public offset: Phaser.Point;
        private isDisabled: boolean;

        public clicked: Phaser.Signal;
        public hoveredOver: Phaser.Signal;
        public hoveredOut: Phaser.Signal;
        public mousePressed: Phaser.Signal;
        public mouseReleased: Phaser.Signal;

        public get x(): number {
            return this.position.x;
        }

        public set x(_x: number) {
            this.position.x = _x;
        }

        public get y(): number {
            return this.position.y;
        }

        public set y(_y: number) {
            this.position.y = _y;
        }

        public get offsetX(): number {
            return this.offset.x;
        }

        public set offsetX(x) {
            this.offset.x = x;
        }

        public get offsetY(): number {
            return this.offset.y;
        }

        public set offsetY(y) {
            this.offset.y = y;
        }

        public get disabled(): boolean {
            return this.isDisabled;
        }

        public set disabled(disabled: boolean) {
            if (disabled) {
                this.button.frame = 3;
                this.button.setFrames(3, 3, 3, 3);
            }
            else {
                this.button.setFrames(1, 0, 2, 1);
            }

            this.isDisabled = disabled;
            this.button.inputEnabled = !this.isDisabled;
        }

        constructor(public key: string, x: number, y: number, buttonWidth: number, buttonHeight: number) {
            this.game = Game.Instance;
            this.position = new Phaser.Point(x, y);
            this.width = buttonWidth;
            this.height = buttonHeight;
            this.offset = new Phaser.Point();

            this.clicked = new Phaser.Signal();
            this.hoveredOver = new Phaser.Signal();
            this.hoveredOut = new Phaser.Signal();
            this.mousePressed = new Phaser.Signal();
            this.mouseReleased = new Phaser.Signal();

            this.preload();
        }

        public preload() {
            var url = 'assets/textures/misc/' + this.key + '.png';
            this.game.load.spritesheet(this.key, url, this.width, this.height);
        }

        public create() {
            var overFrame = 1;
            var outFrame = 0;
            var downFrame = 2;
            var upFrame = 1;

            var x = this.x;
            var y = this.y;

            this.button = this.game.add.button(this.x, this.y, this.key, this._onClick, this, overFrame, outFrame, downFrame, upFrame);

            this.button.onInputOver.add(this._onHover, this);
            this.button.onInputOut.add(this._onHoverOut, this);
            this.button.onInputDown.add(this._onMouseDown, this);
            this.button.onInputDown.add(this._onMouseUp, this);

            this.button.fixedToCamera = true;
            this.button.position.set(0, 0);
            this.button.cameraOffset.x = x;
            this.button.cameraOffset.y = y;
        }

        private _onClick() {
            if (!this.disabled) {
                this.clicked.dispatch(this);
            }
        }

        private _onHover() {
            if (!this.disabled) {
                this.hoveredOver.dispatch(this);
            }
        }
        
        private _onHoverOut() {
            if (!this.disabled) {
                this.hoveredOut.dispatch(this);
            }
        }

        private _onMouseDown() {
            if (!this.disabled) {
                this.mousePressed.dispatch(this);
            }
        }

        private _onMouseUp() {
            if (!this.disabled) {
                this.mouseReleased.dispatch(this);
            }
        }
    }
} 