// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class InfoState extends Phaser.State {
        private timeToWait: number;
        private setUpInput: boolean;
        private addCallbacks: boolean;
        private map: GameMap;
        private script: ScriptEngine;

        constructor() {
            super();

            this.addCallbacks = true;
        }

        init(args: any[]) {
            this.map = args[0];
            this.script = args[1];
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

            var header = Text.createText("How to Play", {
                centeredX: true,
                y: 24,
                style: {
                    align: "center",
                    fill: "#FFFF77",
                    font: "36px MedievalSharpBook"
                }
            });

            var featuresStyle = {
                font: "22px MedievalSharpBook",
                align: "left",
                fill: "#FFFFFF"
            };

            var features = Text.createLines([
                "Use arrow keys, WASD, or XBox 360 DPAD to move",
                "Z, Y, Spacebar, or the XBox 360 'A' button to shoot",
                "Hold the 'shoot' button to charge your weapon.",
                "",
                "Tip: You can place archers on castle walls."
            ], { x: 50, y: 125, style: featuresStyle }, 1);
            var lastItem = features[features.length - 1];

            var anyKeyText = "Press any key to continue.";
            if (this.game.input.gamepad.padsConnected > 0) {
                anyKeyText = "Press any button to continue.";
            }

            var measurements = Text.measureText(anyKeyText, 20);
            var pressAnyKey = Text.createText(anyKeyText, {
                centerX: true,
                x: this.stage.width / 2 - measurements.width / 2,
                y: this.stage.height - measurements.height - 5,
                style: {
                    align: "center",
                    fill: "#FFFFFF",
                    font: "20px MedievalSharpBook"
                }
            });

            createTween(header);
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
            if (this.game.state.current === States.Info) {
                States.Instance.switchTo(States.GameSimulation, true, false, this.map, this.script);
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