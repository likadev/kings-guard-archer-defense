// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class SimulationController extends GameController {
        protected waveInProgress: boolean;
        protected debugMode: boolean;
        protected shownFailureAnimation: boolean;
        protected goldBar: Phaser.Sprite;
        protected goldBarTextSprite: Phaser.Sprite;
        protected goldBarText: Phaser.Text;
        protected antistuckRunning: boolean;
        protected removeEvent: Phaser.TimerEvent;

        init(context: GameContext) {
            super.init(context);

            this.waveInProgress = false;
            this.debugMode = false;
            this.shownFailureAnimation = false;
        }

        preload() {
            super.preload();
        }

        create() {
            super.create();

            var spawnPoint = this.map.toPixels(this.map.heroSpawnPoint).add(16, 16);
            var invisSprite = this.game.add.sprite(this.hero.x, this.hero.y);
            invisSprite.visible = false;

            if (this.script.waveIndex === 0) {
                this.camera.follow(this.hero, Phaser.Camera.FOLLOW_LOCKON);
                this.camera.setBoundsToWorld();
                this.camera.roundPx = true;
            }
            else {
                var moveToCenter = this.game.add.tween(invisSprite).to({ x: spawnPoint.x, y: spawnPoint.y }, 1000, Phaser.Easing.Linear.None, false, 0);
                moveToCenter.onComplete.addOnce(() => {
                    (<any>this.camera).unfollow();
                    invisSprite.kill();

                    this.camera.follow(this.hero, Phaser.Camera.FOLLOW_LOCKON);
                    this.camera.setBoundsToWorld();
                    this.camera.roundPx = true;

                    Input.enablePlayerInput(this.hero);
                });
                moveToCenter.start();

                this.camera.follow(invisSprite);
            }

            this.waveInProgress = !!this.script.nextWave((enemyType: string, position?: Phaser.Point) => {
                if (this.done) {
                    return;
                }

                if (!position) {
                    position = this.actors.peekNextSpawnPoint();
                }

                var spawnCounter = 0;
                var trySpawn: () => any = null;
                trySpawn = () => {
                    var rect = new Phaser.Rectangle(position.x - 16, position.y - 16, 32, 32);
                    var occupants = OccupiedGrid.getOccupantsInBounds(rect);
                    if (occupants.length === 0) {
                        //console.log('[' + (++spawnCounter).toString() + '] spawn ' + enemyType + ' at (' + position.x + ', ' + position.y + ')');
                        var enemy = this.actors.createEnemy(enemyType);

                        if (this.skillChallengeMode) {
                            enemy.health = 999999999;
                        }
                    }
                    else {
                        this.game.time.events.add(250,() => {
                            trySpawn();
                        }, this);
                    }
                };

                trySpawn();
            });

            if (!this.waveInProgress) {
                AnimationHelper.createTextPopup("VICTORY!", 250, 7000,() => {
                    this.done = true;
                });
                return;
            }
            else {
                this.game.time.events.add(500,() => {
                    AnimationHelper.createTextPopup("PROTECT THE KING");
                    if (!this.skillChallengeMode) {
                        AnimationHelper.createTextSubPopup("WAVE " + this.script.waveIndex);
                    }
                }, this);

                this.antistuckRunning = false;
            }

            this.game.input.keyboard.addKey(Phaser.Keyboard.TILDE).onUp.add(() => {
                this.debugMode = !this.debugMode;
            });

            if (!this.goldBar && !this.skillChallengeMode) {
                this.goldBar = this.game.add.sprite(0, 0, 'gold_bar');
                this.goldBar.fixedToCamera = true;
                (<any>this.goldBar).renderPriority = 99;
                this.goldBarText = Text.createText(this.hero.gold.toString(), {
                    x: 0,
                    y: 0,
                    style: {
                        fill: "#FFFFFF",
                        font: "16px MedievalSharpBook",
                        align: "left"
                    }
                });

                this.goldBarTextSprite = this.game.add.sprite(0, 0);
                this.goldBarTextSprite.addChild(this.goldBarText);
                (<any>this.goldBarTextSprite).renderPriority = 100;
                this.goldBarTextSprite.fixedToCamera = true;
                this.goldBarTextSprite.cameraOffset.x = 20;
                this.goldBarTextSprite.cameraOffset.y = 2;

                this.goldBarTextSprite['update'] = () => {
                    this.goldBarText.text = this.hero.gold.toString();
                };
            }
        }

        update() {
            super.update();

            var projectiles = this.projectiles;

            projectiles.update();

            var physics = this.game.physics.arcade;
            var actors = this.actors;

            physics.collide(projectiles.getActiveProjectiles(), this.actors.enemies,(first, second) => {
                this.handleProjectileCollision(first, second);
            });

            /*if (this.game.input.activePointer.isDown) {
                var x = this.game.input.activePointer.worldX;
                var y = this.game.input.activePointer.worldY;
                this.handleMouseClicked(x, y);
            }*/

            if (this.waveInProgress) {
                if (!this.script.waveInProgress && this.actors.enemies.length === 0) {
                    console.log('wave complete!');
                    this.waveInProgress = false;

                    if (!this.script.hasNextWave()) {
                        AnimationHelper.createTextPopup("VICTORY!", 250, 7000,() => {
                            this.done = true;
                        });
                    }
                    else {
                        this.hero.revive(5);

                        GameController.switchTo('PrepareDefenseController');
                    }
                    return;
                }
            }

            if (!this.hero.alive) {
                (<any>this.game.camera).unfollow();
                this.game.camera.focusOnXY(this.king.x, this.king.y);
            }

            if (!actors.king.alive && !this.skillChallengeMode && !this.shownFailureAnimation) {
                this.showFailureAnimation();
            }

            this.runAntistuck();
        }

        render() {
            super.render();

            if (this.debugMode) {
                
            }
        }

        destroy() {
            super.destroy();
        }

        private runAntistuck() {
            if (!this.waveInProgress) {
                return;
            }

            for (var i = 0, l = this.enemies.length; i < l; ++i) {
                var enemy = this.enemies[i];
                if (enemy.health >= 0) {
                    var indices = OccupiedGrid.getIndicesOfSprite(enemy, true);
                    if ($.inArray(-1, indices) >= 0) {
                        var enem: any = enemy;
                        if (typeof enem.killTime === 'undefined') {
                            enem.killTime = 5000;
                        }
                        else {
                            enem.killTime -= this.game.time.physicsElapsedMS;
                            if (enem.killTime <= 0) {
                                console.log('running anti-stuck on enemy');
                                enemy.inflictDamage(99999, this.hero);
                            }
                        }
                    }
                    else {
                        if (typeof enemy['killTime'] === 'number') {
                            delete enemy['killTime'];
                        }
                    }
                }
            }
        }

        /**
         *  Show the user an animation indicating that the user has lost.
         */
        private showFailureAnimation() {
            this.shownFailureAnimation = true;
            this.game.time.events.add(1000,() => {
                var failure = this.game.add.text(0, 0, 'YOU LOSE', {
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
         *  Determine what to do when the user clicks.
         */
        private handleMouseClicked(x: number, y: number) {
            if (this.skillChallengeMode) {
                return;
            }

            var tile: Phaser.Point = <Phaser.Point>this.map.fromPixels(new Phaser.Point(x, y));
            var position = (<Phaser.Point>this.map.toPixels(tile)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
            var mercType: MercenaryType = this.game.cache.getJSON("mercenary_longbowman");

            if (OccupiedGrid.canOccupyInPixels(null, position.x, position.y)) {
                this.actors.createMercenary(position.x, position.y, mercType);
            }
        }

        /**
         *  Handle the case that a projectile has collided with an enemy.
         */
        private handleProjectileCollision(projectile: FiredProjectile, sprite: Enemy) {
            if (projectile.dead) {
                return;
            }

            projectile.attachTo(sprite);
            sprite.inflictDamage(projectile.power, projectile.firedBy);
        }
    }
}