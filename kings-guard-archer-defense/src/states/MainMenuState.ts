// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class MainMenuState extends Phaser.State {
        private map: GameMap;
        private script: ScriptEngine;
        private loading: boolean;
        private playButton: Phaser.Button;
        private skillChallengeButton: Phaser.Button;
        private centerX: number;
        private centerY: number;
        private containerWidth: number;
        private containerHeight: number;
        private skillChallenge: boolean;
        private buttonIndex: number = 0;
        private cursors: Phaser.CursorKeys;

        constructor() {
            super();
        }

        init(args?: any[]) {
            this.map = null;
            this.script = null;
            this.skillChallenge = false;
            this.buttonIndex = 0;
        }

        preload(): void {
            this.game.load.spritesheet('play_button', 'assets/textures/misc/play_button.png', 128, 64, 3);
            this.game.load.spritesheet('skill_challenge_button', 'assets/textures/misc/skill_challenge_button.png', 128, 64, 3);

            this.script = new ScriptEngine();
            this.script.preload();
        }

        create(): void {
            this.centerX = this.centerX || this.game.world.centerX;
            this.centerY = this.centerY || this.game.world.centerY;
            this.containerWidth = this.containerWidth || this.game.world.width;
            this.containerHeight = this.containerHeight || this.game.world.height;

            var header = Text.createText("King's Guard: Archer Defense", {
                centeredX: true,
                style: {
                    font: "32px MedievalSharpBook",
                    align: "center"
                },
                addToWorld: true,
                fixedToCamera: true
            });

            Text.createText("(Pre-alpha)", {
                centeredX: true,
                y: header.height + 2,
                style: {
                    font: "24px MedievalSharpBook",
                    fill: "#AAAAAA",
                    align: "center"
                },
                addToWorld: true,
                fixedToCamera: true
            });

            var footerHeight = Text.measureText("Tip: Hold down the 'fire' button to charge your weapon.", 16).height;
            Text.createText("Tip: Hold down the 'fire' button to charge your weapon.", {
                style: {
                    font: "16px MedievalSharpBook",
                    align: "center"
                },
                centeredX: true,
                y: this.containerHeight - footerHeight * 2,
                addToWorld: true,
                fixedToCamera: true
            });

            Text.createText("(Z, Y, Space, or XBox 360 'A' button)", {
                style: {
                    font: "16px MedievalSharpBook",
                    fill: "#AAAAAA",
                    align: "center"
                },
                y: this.containerHeight - footerHeight,
                centeredX: true,
                addToWorld: true,
                fixedToCamera: true,
            });

            var buttonWidth = 128;
            var buttonHeight = 64;
            var spacing = 16;

            var playButtonPosition = {
                x: this.centerX - (buttonWidth / 2),
                y: this.centerY - (buttonHeight / 2) - buttonHeight
            };

            var skillChallengeButton = {
                x: this.centerX - (buttonWidth / 2),
                y: this.centerY - (buttonHeight / 2) + spacing
            };

            this.playButton = this.game.add.button(playButtonPosition.x, playButtonPosition.y, 'play_button');
            this.skillChallengeButton = this.game.add.button(skillChallengeButton.x, skillChallengeButton.y, 'skill_challenge_button');

            this.playButton.onInputOver.add(this.hover, this);
            this.playButton.onInputOut.add(this.blur, this);
            this.playButton.onInputDown.add(this.down, this);
            this.playButton.onInputUp.add(this.up, this);

            this.skillChallengeButton.onInputOver.add(this.hover, this);
            this.skillChallengeButton.onInputOut.add(this.blur, this);
            this.skillChallengeButton.onInputDown.add(this.down, this);
            this.skillChallengeButton.onInputUp.add(this.up, this);

            this.game.input.gamepad.start();

            this.cursors = this.game.input.keyboard.createCursorKeys();

            var okKeys = [
                this.game.input.keyboard.addKey(Phaser.Keyboard.Z),
                this.game.input.keyboard.addKey(Phaser.Keyboard.Y),
                this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
                this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER),
            ];

            for (var i = 0, l = okKeys.length; i < l; ++i) {
                okKeys[i].onDown.add(() => {
                    if (this.buttonIndex !== -1) {
                        this.down(this.buttonIndex === 0 ? this.playButton : this.skillChallengeButton);
                    }
                }, this);

                okKeys[i].onUp.add(() => {
                    if (this.buttonIndex !== -1) {
                        this.up(this.buttonIndex === 0 ? this.playButton : this.skillChallengeButton);
                    }
                    else {
                        this.processButtonIndex();
                    }
                }, this);
            }

            this.playButton.frame = 1;
        }

        update(): void {
            if (this.map && this.map.ready) {
                var states = States.Instance;
                states.switchTo(States.PreGameLoading, true, false, this.map, this.script, this.skillChallenge);
                return;
            }

            if (this.cursors.up.justDown || this.input.gamepad.justPressed(Phaser.Gamepad.XBOX360_DPAD_UP)) {
                this.decrementButtonIndex();
            }
            else if (this.cursors.down.justDown || this.input.gamepad.justPressed(Phaser.Gamepad.XBOX360_DPAD_DOWN)) {
                this.incrementButtonIndex();
            }

            if (this.input.gamepad.justReleased(Phaser.Gamepad.XBOX360_A)) {
                if (this.buttonIndex !== -1) {
                    this.up(this.buttonIndex === 0 ? this.playButton : this.skillChallengeButton);
                }
                else {
                    this.processButtonIndex();
                }
            }
            else if (this.input.gamepad.justPressed(Phaser.Gamepad.XBOX360_A)) {
                if (this.buttonIndex !== -1) {
                    this.down(this.buttonIndex === 0 ? this.playButton : this.skillChallengeButton);
                }
            }
        }
        
        private incrementButtonIndex() {
            ++this.buttonIndex;
            this.processButtonIndex();
        }

        private decrementButtonIndex() {
            --this.buttonIndex;
            this.processButtonIndex();
        }

        private processButtonIndex() {
            if (this.buttonIndex < 0) {
                this.buttonIndex = 0;
            }

            if (this.buttonIndex > 1) {
                this.buttonIndex = 1;
            }

            if (this.buttonIndex === 0) {
                this.hover(this.playButton, false);
            }
            else if (this.buttonIndex === 1) {
                this.hover(this.skillChallengeButton, false);
            }
        }

        private hover(button: Phaser.Button, suppressButtonIndex: boolean = true) {
            button.frame = 1;

            if (button === this.skillChallengeButton) {
                this.playButton.frame = 0;
            }
            else {
                this.skillChallengeButton.frame = 0;
            }

            if (suppressButtonIndex) {
                this.buttonIndex = -1;
            }
        }

        private blur(button: Phaser.Button, suppressButtonIndex: boolean = true) {
            button.frame = 0;

            if (suppressButtonIndex) {
                this.buttonIndex = -1;
            }
        }

        private down(button: Phaser.Button) {
            button.frame = 2;
        }
        
        private up(button: Phaser.Button) {
            button.frame = 1;

            if (button === this.skillChallengeButton) {
                this.startSkillChallenge();
            }
            else {
                this.startRegularGame();
            }
        }

        private startRegularGame() {
            this.skillChallenge = false;
            var firstLevel = "level_1";
            this.map = new GameMap(firstLevel);
            Game.CurrentMap = this.map;

            this.script.create(firstLevel);
        }

        private startSkillChallenge(): void {
            this.skillChallenge = true;
            var firstLevel = "skill_challenge";
            this.map = new GameMap(firstLevel);
            Game.CurrentMap = this.map;

            this.script.create(firstLevel);
        }
    }
}