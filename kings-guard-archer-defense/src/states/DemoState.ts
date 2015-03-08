// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class DemoState extends Phaser.State {
        private timeToWait: number;
        private setUpInput: boolean;
        private addCallbacks: boolean;

        constructor() {
            super();

            this.addCallbacks = true;
        }

        create() {
            this.camera.bounds.x = 0;
            this.camera.bounds.y = 0;

            var delay = 0;
            var createTween = (text: Phaser.Text) => {
                text.alpha = 0;
                var tween = this.game.add.tween(text).to({ alpha: 1 }, 50, Phaser.Easing.Cubic.InOut, true, delay, 3);

                delay += 500;

                this.game.world.add(text);

                return tween;
            };

            var header = Text.createText("Thanks for playing!", {
                centeredX: true,
                y: 24,
                style: {
                    align: "center",
                    fill: "#77FF77",
                    font: "36px MedievalSharpBook"
                }
            });

            var subHeader = Text.createText("Features planned:", {
                centeredX: true,
                y: header.y + header.height + 2,
                style: {
                    align: "center",
                    fill: "#FFFFFF",
                    font: "26px MedievalSharpBook"
                }
            });

            var featuresStyle = {
                font: "22px MedievalSharpBook",
                align: "left",
                fill: "#FFFFFF"
            };

            var features = Text.createLines([
                "- Full campaign mode",
                "- More mercenaries for hire",
                "- Build traps",
                "- Re-work graphics",
                "- Music and sound",
                "- Stat upgrades",
                "- Player abilities",
                "- More skill challenges",
                "- Buy new skins and weapons with microtransactions",
                "- (I'm joking)",
                "- (Probably)",
                "- King will react to being attacked",
            ], { x: 75, y: subHeader.y + subHeader.height + 5, style: featuresStyle }, 1);
            var lastItem = features[features.length - 1];

            var anyKeyText = "Press any key to continue.";
            if (this.game.input.gamepad.padsConnected > 0) {
                anyKeyText = "Press any button to continue.";
            }

            var measurements = Text.measureText(anyKeyText, 20);
            var pressAnyKey = Text.createText(anyKeyText, {
                centerX: true,
                x: this.stage.width / 2 - measurements.width / 2,
                y: this.stage.height - subHeader.height - 5,
                style: {
                    align: "center",
                    fill: "#FFFFFF",
                    font: "20px MedievalSharpBook"
                }
            });

            createTween(header);
            createTween(subHeader);
            for (var i = 0, l = features.length; i < l; ++i) {
                createTween(features[i]);
            }
            createTween(pressAnyKey);

            this.timeToWait = delay;
            this.setUpInput = false;
        }

        update() {
            if (this.timeToWait > 0) {
                this.timeToWait -= this.time.physicsElapsedMS;
                if (this.timeToWait < 0) {
                    this.timeToWait = 0;
                }
            }

            if (this.timeToWait === 0 && !this.setUpInput) {
                this.addAnyKeyHandler();
                this.setUpInput = true;
            }

            if (this.timeToWait === 0) {
                if (this.input.activePointer.isDown) {
                    this.switchStates();
                }
            }
        }

        private switchStates() {
            if (this.game.state.current === States.Demo) {
                States.Instance.switchTo(States.Boot, true, false);
            }
        }

        private addAnyKeyHandler() {
            if (this.addCallbacks) {
                this.addCallbacks = false;
            }
            else {
                return;
            }

            this.game.input.keyboard.addCallbacks(this, null, this.switchStates);

            this.game.input.gamepad.addCallbacks(this, {
                onUp: () => {
                    this.switchStates();
                }
            });
        }
    }
}