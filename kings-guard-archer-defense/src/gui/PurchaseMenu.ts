// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class PurchaseMenu extends GameController {
        private _parchment: Phaser.Sprite;
        private _readyButton: Button;
        private _headerText: Phaser.Sprite;
        private _ready: boolean;
        private _clicked: boolean;
        private _mercenariesForHire: MercenaryType[];
        private _mercenaryButtons: Button[];
        private _parchmentHidden: boolean;
        private _previewButton: Button;
        private _previewSprite: Phaser.Sprite;
        private _previewKey: string;

        public get ready(): boolean {
            return this._ready;
        }

        public get parchment(): Phaser.Sprite {
            return this._parchment;
        }

        public get parchmentPosition(): Phaser.Point {
            return this.parchment.cameraOffset;
        }

        public init(context: GameContext) {
            super.init(context);

            this._ready = false;
        }

        public create() {
            this._parchment = this.game.add.sprite(this.camera.view.width, 0, 'parchment');
            this.parchment.cameraOffset.x = this.camera.view.width - 1;
            (<any>this.parchment).renderPriority = 3;

            var tween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width - this.parchment.width },
                250, Phaser.Easing.Exponential.In, true, 500);

            this.parchment.fixedToCamera = true;
            this.parchment.x = 0;

            var headerText = Text.createText("Mercenaries", {
                style: {
                    fill: "#000000",
                    font: "28px MedievalSharpBook"
                }
            });

            this._headerText = this.game.make.sprite(this.parchmentPosition.x + 20, this.parchmentPosition.y + 10);
            this._headerText.addChild(headerText);
            this._headerText.fixedToCamera = true;
            (<any>this._headerText).renderPriority = 4;
            this.world.add(this._headerText);

            this._readyButton = new Button('ready_button', this.camera.view.width, this.camera.view.height - 52, 96, 48);
            this._readyButton.create();
            this._readyButton.clicked.add(this.onReadyClicked, this);

            this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width - this._readyButton.width - 4 }, 250, Phaser.Easing.Exponential.In, true, 500);

            this._clicked = false;

            // TODO:
            this._mercenariesForHire = [
                <MercenaryType>this.game.cache.getJSON('mercenary_longbowman')
            ];

            this._mercenaryButtons = [
                new Button('merc_frame', this.camera.view.width, 0, 36, 36)
            ];

            var parchment = this._parchment;
            for (var i = 0, l = this._mercenaryButtons.length; i < l; ++i) {
                var mercType = this._mercenariesForHire[i];
                var button = this._mercenaryButtons[i];
                button.create();

                var sprite = this.game.add.sprite(this.camera.view.width, 0, mercType.key);
                AnimationLoader.addAnimationToSprite(sprite, mercType.key);
                sprite.animations.play('face_down', 0, false);
                sprite.fixedToCamera = true;
                sprite.anchor.set(0.5, 0.5);
                (<any>sprite).renderPriority = 999;

                var phaserButton = button.button;
                phaserButton.fixedToCamera = true;
                (<any>phaserButton).renderPriority = 4;
                phaserButton['update'] = function () {
                    phaserButton.cameraOffset.x = parchment.cameraOffset.x + 16;
                    phaserButton.cameraOffset.y = parchment.cameraOffset.y + 48;
                    sprite.cameraOffset.x = phaserButton.cameraOffset.x + phaserButton.width / 2;
                    sprite.cameraOffset.y = phaserButton.cameraOffset.y + phaserButton.height / 2;
                };

                button['previewSprite'] = sprite;

                button.clicked.add((btn: Button) => {
                    this.hideParchment();
                    this.startPreviewingMercenaryPlacement(btn);
                }, this);
            }

            this._parchmentHidden = false;
            this.updateButtonStatus();
        }

        public update() {
            super.update();

            this._headerText.cameraOffset.x = this.parchmentPosition.x + 20;
            this._headerText.cameraOffset.y = this.parchmentPosition.y + 10;

            if (!this._clicked && (this.game.input.gamepad.isDown(Phaser.Gamepad.XBOX360_START) ||
                this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER))) {
                this._clicked = true;
                this._readyButton.button.frame = 1;
                this.game.time.events.add(50,() => {
                    this._readyButton.button.frame = 2;

                    this.onReadyClicked();
                    this.game.time.events.add(50,() => {
                        this._readyButton.button.frame = 1;
                    }, this);
                }, this);
            }

            if (this._parchmentHidden) {
                if (this._parchment.input.checkPointerOver(this.game.input.activePointer)) {
                    this.showParchment();
                }
                else if (this.game.input.activePointer.isDown) {
                    this.handleMouseClicked(this.game.input.activePointer.x, this.game.input.activePointer.y);
                }
            }
        }

        public destroy() {
            super.destroy();

            var parchmentTween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width + 1 },
                250, Phaser.Easing.Exponential.Out, true, 0);
            var readyButtonTween = this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width + 1 },
                250, Phaser.Easing.Exponential.Out, true, 0);

            parchmentTween.onComplete.addOnce(() => {
                this._parchment.kill();
            }, this);

            readyButtonTween.onComplete.addOnce(() => {
                this._readyButton.button.kill();
            });

            this._headerText.destroy(true);

            this.stopPreviewingMercenaryPlacement();

            for (var i = 0, l = this._mercenaryButtons.length; i < l; ++i) {
                var button = this._mercenaryButtons[i];
                button.button.kill();
            }
        }
        
        private startPreviewingMercenaryPlacement(button: Button) {
            var sprite = button['previewSprite'];
            if (sprite) {
                this._previewButton = button;
                this._previewSprite = this.game.add.sprite(0, 0, sprite.key);
                this._previewKey = 'mercenary_' + sprite.key;
                var mercType: MercenaryType = this.game.cache.getJSON(this._previewKey);
                AnimationLoader.addAnimationToSprite(this._previewSprite, this._previewKey);
                this._previewSprite.key = null;
                this._previewSprite.animations.play('face_down', 1, false);
                this._previewSprite.alpha = 0.5;
                this._previewSprite.anchor.setTo(0.5);
                this._previewSprite.tint = 0xFF7777;
                (<any>this._previewSprite).renderPriority = 9;

                this._previewSprite['update'] = () => {
                    if (!this._parchmentHidden) {
                        return;
                    }

                    var pos = this.map.fromPixels(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY);
                    pos = this.map.toPixels(pos).add(16, 16);

                    this._previewSprite.x = pos.x;
                    this._previewSprite.y = pos.y;

                    //this.game.debug.rectangle(new Phaser.Rectangle(pos.x - 16, pos.y - 16, 32, 32), '#FFFFFF', false);

                    if ((mercType.canPerch && OccupiedGrid.canOccupyInPixels(null, this._previewSprite.position)) ||
                        this.map.canPerchInPixels(this._previewSprite.x, this._previewSprite.y)) {
                        this._previewSprite.tint = 0x77FF77;
                    }
                    else {
                        this._previewSprite.tint = 0xFF7777;
                    }
                };
            }
        }

        private stopPreviewingMercenaryPlacement() {
            if (this._previewSprite) {
                this._previewSprite['update'] = () => { };
                this._previewSprite.kill();
                this._previewSprite = null;
            }
        }

        private hideParchment() {
            var tween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width - 16 },
                250, Phaser.Easing.Exponential.Out, false, 0);
            tween.onComplete.addOnce(() => {
                this._parchmentHidden = true;
                this._parchment.inputEnabled = true;
            });
            tween.start();

            this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width },
                250, Phaser.Easing.Exponential.Out, true, 0);
        }

        private showParchment() {
            var tween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width - this.parchment.width },
                250, Phaser.Easing.Exponential.Out, false, 0);
            tween.start();

            this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width - this._readyButton.width - 4 }, 250, Phaser.Easing.Exponential.Out, true);

            this.stopPreviewingMercenaryPlacement();
            this._parchmentHidden = false;
            this._parchment.inputEnabled = false;

            this._previewButton.button.bringToTop();
            var preview: Phaser.Sprite = this._previewButton['previewSprite'];
            preview.bringToTop();
        }

        /**
         *  Determine what to do when the user clicks.
         */
        private handleMouseClicked(x: number, y: number) {
            if (!this._previewSprite) {
                return;
            }

            var tile: Phaser.Point = <Phaser.Point>this.map.fromPixels(new Phaser.Point(this._previewSprite.x, this._previewSprite.y));
            var position = (<Phaser.Point>this.map.toPixels(tile)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
            var mercType: MercenaryType = this.game.cache.getJSON(this._previewKey);

            var canOccupy = OccupiedGrid.canOccupyInPixels(null, position.x, position.y);
            var canPerch = mercType.canPerch && this.map.canPerchInPixels(position.x, position.y)
            var isPerched = canPerch && !canOccupy;

            if ((mercType.canPerch && this.map.canPerchInPixels(position.x, position.y)) || canOccupy) {
                var merc = this.actors.createMercenary(position.x, position.y, mercType);
                merc.isPerched = isPerched;

                this.hero.gold -= mercType.cost;
                this.updateButtonStatus();

                this.showParchment();
            }
        }

        private updateButtonStatus() {
            for (var i = 0, l = this._mercenaryButtons.length; i < l; ++i) {
                var button = this._mercenaryButtons[i];
                var mercType = this._mercenariesForHire[i];
                button.disabled = this.hero.gold < mercType.cost;
                var sprite: Phaser.Sprite = button['previewSprite'];
                if (button.disabled) {
                    sprite.tint = 0x777777;
                }
                else {
                    sprite.tint = 0xFFFFFF;
                }
            }
        }

        private onReadyClicked() {
            this._ready = true;
        }
    }
} 