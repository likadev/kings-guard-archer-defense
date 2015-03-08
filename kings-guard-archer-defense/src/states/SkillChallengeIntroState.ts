// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class SkillChallengeIntroState extends Phaser.State {
        private map: GameMap;
        private script: ScriptEngine;
        private ready: boolean;

        private centerX: number;
        private centerY: number;

        init(args: any[]): void {
            this.map = args[0];
            this.script = args[1];

            this.ready = false;

            this.centerX = this.centerX || Game.Width / 2;
            this.centerY = this.centerY || Game.Height / 2;
        }

        preload(): void {
            this.game.input.gamepad.start();
        }

        create(): void {
            var headerText = this.game.add.text(0, 0, 'SKILL CHALLENGE', {
                font: '36px MedievalSharpBook',
                fill: '#FFFFFF',
                align: 'center'
            });

            headerText.position.set(this.centerX - (headerText.width / 2), 50);
            headerText.fixedToCamera = true;

            var childStyle = {
                font: '20px MedievalSharpBook',
                fill: '#FFFFFF',
                align: 'left'
            };

            var initialHeight = 125;
            var firstRow = this.game.add.text(25, initialHeight, '- Protect the king.', childStyle);
            var yIncrement = firstRow.height + 5;

            this.game.add.text(25, initialHeight + (yIncrement * 1), "- Don't die.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 2), "- Enemies can't die.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 3), "- Enemies will try to kill the king.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 4), "- Attack enemies to make them focus on you.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 5), "- Kite enemies around, but don't get trapped.", childStyle);

            var minutes = this.game.add.text(this.centerX, initialHeight + (yIncrement * 7), "You have 3 minutes.", childStyle);
            minutes.x = this.centerX - (minutes.width / 2);

            var beginKeyText = "Press any key to begin.";
            var beginButtonText = "Press any button to begin.";
            var gamepadEnabled = this.game.input.gamepad.padsConnected > 0;

            var gamepadText: Phaser.Text = null;
            if (gamepadEnabled) {
                gamepadText = this.game.add.text(this.centerX, initialHeight + (yIncrement * 10), "(Gamepad is enabled!)", {
                    font: '18px MedievalSharpBook',
                    fill: '#99FF99',
                    align: 'center'
                });
                gamepadText.x = this.centerX - (gamepadText.width / 2);
            }
            else {
                gamepadText = this.game.add.text(this.centerX, initialHeight + (yIncrement * 10), "(Press any button on the gamepad to use it.)", {
                    font: '18px MedievalSharpBook',
                    fill: '#CCCCCC',
                    align: 'center'
                });
                gamepadText.x = this.centerX - (gamepadText.width / 2);
            }

            var beginTextObj = this.game.add.text(this.centerX, initialHeight + (yIncrement * 9), gamepadEnabled ? beginButtonText : beginKeyText, childStyle);
            beginTextObj.x = this.centerX - (beginTextObj.width / 2);

            this.game.input.keyboard.addCallbacks(this,null,() => {
                this.ready = true;
            });

            this.game.input.gamepad.addCallbacks(this, {
                onConnect: () => {
                    if (gamepadText) {
                        gamepadText.destroy();
                    }

                    gamepadEnabled = true;
                    gamepadText = this.game.add.text(this.centerX, initialHeight + (yIncrement * 10), "(Gamepad is enabled!)", {
                        font: '18px MedievalSharpBook',
                        fill: '#99FF99',
                        align: 'center'
                    });
                    gamepadText.x = this.centerX - (gamepadText.width / 2);
                    beginTextObj.text = beginButtonText;
                },

                onDisconnect: () => {
                    if (this.game.input.gamepad.padsConnected < 1) {
                        gamepadEnabled = false;
                        if (gamepadText) {
                            gamepadText.visible = false;
                            gamepadText.destroy();
                            beginTextObj.text = beginKeyText;
                        }
                    }
                },

                onUp: () => {
                    this.ready = true;
                }
            });
        }

        update(): void {
            if (this.game.input.activePointer.isDown) {
                this.ready = true;
            }

            if (this.ready) {
                var states = States.Instance;
                states.switchTo(States.GameSimulation, true, false, this.map, this.script, true);
            }
        }
    }
}