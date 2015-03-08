// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class SkillChallengeController extends GameController {
        protected failedSkillChallenge: boolean;
        protected skillChallengeStartTime: number;
        protected skillChallengeEndTime: number;
        protected skillChallengeTimer: Phaser.Text;
        protected shownFailureAnimation: boolean;
        protected shownVictoryAnimation: boolean;

        init(context: GameContext) {
            super.init(context);

            this.shownFailureAnimation = false;
            this.shownVictoryAnimation = false;
        }

        create() {
            super.create();

            if (!this.skillChallengeMode) {
                return;
            }

            this.failedSkillChallenge = false;
            this.skillChallengeStartTime = this.game.time.now;
            this.skillChallengeEndTime = this.skillChallengeStartTime + 180000; // 3mins
            var timeLeft = this.skillChallengeEndTime - this.skillChallengeStartTime;
            this.skillChallengeTimer = this.game.add.text(0, 0, 'Time left: ' + this.formatTime(timeLeft), {
                font: '16px MedievalSharpBook',
                align: 'left',
                fill: '#FFFFFF',
            });
            this.skillChallengeTimer.fixedToCamera = true;

            this.hero.weapon.power = 1000;
        }

        update() {
            super.update();

            if (!this.skillChallengeMode) {
                return;
            }
            
            // If the player or king dies, they've failed the challenge.
            if (!this.hero.alive || !this.king.alive) {
                this.failedSkillChallenge = true;
            }

            // If the king isn't alive, show the player the "FAILURE" animation (if we haven't already).
            if (!this.king.alive && !this.shownFailureAnimation) {
                this.showFailureAnimation();
            }

            this.updateSkillTimer();
        }

        /**
         *  Updates the timer, which is counting down until the player wins.
         */
        private updateSkillTimer() {
            this.skillChallengeStartTime += this.game.time.elapsedMS;
            var timeLeftMs = this.skillChallengeEndTime - this.skillChallengeStartTime;
            if (timeLeftMs <= 0) {
                if (timeLeftMs <= 0 && !this.failedSkillChallenge && !this.shownVictoryAnimation) {
                    this.showVictoryAnimation();
                }
            }
            else if (!this.failedSkillChallenge) {
                var timeLeft = this.formatTime(timeLeftMs);
                this.skillChallengeTimer.text = 'Time left: ' + timeLeft;
                if (timeLeftMs < 10000) {
                    this.skillChallengeTimer.tint = 0xFF7777;
                }

                if (!this.actors.hero.alive || !this.actors.king.alive) {
                    this.failedSkillChallenge = true;
                }
            }
        }

        /**
         *  Show the user an animation indicating that he has won.
         */
        private showVictoryAnimation() {
            this.shownVictoryAnimation = true;
            this.actors.hero.health = 999;
            this.actors.king.health = 999;

            var enemies = this.actors.enemies;

            var killEnemy: () => any = null;
            killEnemy = () => {
                if (enemies.length > 0) {
                    var enemy: Enemy = enemies.pop();
                    enemy.inflictDamage(9999999999, this.actors.hero);

                    this.game.time.events.add(100, killEnemy, this);
                }
                else {
                    this.game.time.events.add(15000,() => {
                        this.done = true;
                    }, this);
                }
            };

            this.skillChallengeTimer.destroy();
            this.skillChallengeTimer = null;

            var greatJobText = this.game.add.text(0, 0, 'GREAT JOB!!!', {
                font: '48px MedievalSharpBook',
                align: 'center',
                fill: '#FFFFFF'
            });
            greatJobText.x = this.game.camera.width / 2 - greatJobText.width / 2;
            greatJobText.fixedToCamera = true;

            var tween = this.game.add.tween(greatJobText).to({
                tint: 0x33FF33
            }, 250, <any>Phaser.Easing.Cubic.InOut, true, 0, 999, true);

            killEnemy();
        }

        /**
         *  Show the user an animation indicating that the user has lost.
         */
        private showFailureAnimation() {
            this.shownFailureAnimation = true;
            this.game.time.events.add(1000,() => {
                var failure = this.game.add.text(0, 0, 'YOU ARE A FAILURE', {
                    font: '36px MedievalSharpBook',
                    align: 'center',
                    fill: '#FFFFFF'
                });

                var failureSprite = this.game.make.sprite(this.camera.width / 2 - failure.width / 2, this.camera.height / 2 - failure.height / 2);
                failureSprite.addChild(failure);
                failureSprite.fixedToCamera = true;
                failureSprite.alpha = 0;
                failureSprite.anchor.setTo(0.5);
                failureSprite['renderPriority'] = 9999;
                failureSprite.bringToTop();
                this.game.world.add(failureSprite);

                var tween: Phaser.Tween = this.game.add.tween(failureSprite).to({ alpha: 1 }, 1000);
                tween.start();

                var fadeSprite = this.game.make.sprite(0, 0, 'black');
                (<any>fadeSprite).renderPriority = 9999;
                fadeSprite.width = this.camera.view.width;
                fadeSprite.height = this.camera.view.height;
                fadeSprite.fixedToCamera = true;
                fadeSprite.alpha = 0;
                this.game.world.add(fadeSprite);
                var fadeTween = this.game.add.tween(fadeSprite).to({ alpha: 1 }, 4000);
                fadeTween.onComplete.addOnce(() => {
                    this.game.time.events.add(2000,() => {
                        var finalTween = this.game.add.tween(failureSprite).to({ alpha: 0 }, 1000);
                        finalTween.onComplete.addOnce(() => {
                            this.game.time.events.add(1500,() => {
                                this.done = true;
                            }, this);
                        });
                        finalTween.start();
                    }, this);
                });
                fadeTween.start();

                fadeSprite.bringToTop();
                failureSprite.bringToTop();
            }, this);
        }

        /**
         *  Format a minutes/seconds timestamp as "M:SS".
         */
        private formatTime(timeMs: number): string {
            var date = new Date(timeMs);

            return this.pad(date.getMinutes(), 1, '0') + ':' + this.pad(date.getSeconds(), 2, '0');
        }

        /**
         *  Pad a string out to 'width' characters, filling in the blanks with 'z'.
         */
        private pad(n, width, z): string {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }
    }
}