// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameSimulationState extends Phaser.State {
        private map: GameMap;
        private script: ScriptEngine;

        public actors: Actors;
        public projectiles: ProjectileManager;
        private done: boolean = false;
        private waveInProgress: boolean;

        private skillChallengeMode: boolean;
        private failedSkillChallenge: boolean;
        private skillChallengeStartTime: number;
        private skillChallengeEndTime: number;
        private skillChallengeTimer: Phaser.Text;

        constructor() {
            super();
        }

        init(args: any[]) {
            Game.Simulation = this;

            this.map = args[0];
            this.script = args[1];
            this.skillChallengeMode = !!args[2];
            this.failedSkillChallenge = false;

            this.done = false;
        }

        preload(): void {
            this.actors = new Actors(this.game, this.map);
        }

        create(): void {
            this.map.create();
            this.script.create();

            this.projectiles = new ProjectileManager();

            OccupiedGrid.reset();

            this.actors.createKing();
            var hero = this.actors.createHero();

            var camera = this.game.camera;
            camera.follow(hero, Phaser.Camera.FOLLOW_LOCKON);
            camera.setBoundsToWorld();
            camera.roundPx = true;

            this.waveInProgress = true;
            this.script.nextWave((enemyType: string, position?: Phaser.Point) => {
                if (this.done) {
                    return;
                }

                if (!position) {
                    position = this.actors.peekNextSpawnPoint();
                }

                var trySpawn: () => any = null;
                trySpawn = () => {
                    var rect = new Phaser.Rectangle(position.x - 16, position.y - 16, 32, 32);
                    var occupants = OccupiedGrid.getOccupantsInBounds(rect);
                    if (occupants.length === 0) {
                        console.log('spawn ' + enemyType + ' at (' + position.x + ', ' + position.y + ')');
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

            console.log('Skill challenge enabled: ' + this.skillChallengeMode);
            if (this.skillChallengeMode) {
                this.skillChallengeStartTime = this.game.time.now;
                this.skillChallengeEndTime = this.skillChallengeStartTime + 180000; // 3mins
                var timeLeft = this.skillChallengeEndTime - this.skillChallengeStartTime;
                this.skillChallengeTimer = this.game.add.text(0, 0, 'Time left: ' + this.formatTime(timeLeft), {
                    font: '16px MedievalSharpBook',
                    align: 'left',
                    fill: '#FFFFFF',
                });
                this.skillChallengeTimer.fixedToCamera = true;
            }
        }

        update(): void {
            var projectiles = this.projectiles;

            projectiles.update();

            var physics = this.game.physics.arcade;
            var actors = this.actors;

            physics.collide(projectiles.getActiveProjectiles(), this.actors.enemies,(first, second) => {
                this.handleProjectileCollision(first, second);
            });

            if (this.game.input.activePointer.isDown) {
                var x = this.game.input.activePointer.worldX;
                var y = this.game.input.activePointer.worldY;
                this.handleMouseClicked(x, y);
            }

            this.sortSprites();

            if (this.waveInProgress) {
                if (!this.script.waveInProgress && this.actors.enemies.length === 0) {
                    console.log('wave complete!');
                    this.waveInProgress = false;
                }
            }

            if (!actors.hero.alive) {
                this.failedSkillChallenge = true;

                (<any>this.game.camera).unfollow();
                this.game.camera.follow(actors.king);
            }

            if (!actors.king.alive) {
                if (this.skillChallengeMode && !this.done) {
                    this.showFailureAnimation();
                }
                else if (!this.done) {
                    this.actors.destroy(true);
                    this.game.state.start(States.Boot, true, true);
                }

                this.failedSkillChallenge = true;
                this.done = true;
            }

            if (this.skillChallengeMode) {
                this.skillChallengeStartTime += this.game.time.elapsedMS;
                var timeLeftMs = this.skillChallengeEndTime - this.skillChallengeStartTime;
                if (timeLeftMs <= 0) {
                    if (timeLeftMs <= 0 && !this.failedSkillChallenge) {
                        this.showVictoryAnimation();
                    }
                }
                else if (!this.done) {
                    var timeLeft = this.formatTime(timeLeftMs);
                    this.skillChallengeTimer.text = 'Time left: ' + timeLeft;
                    if (!this.actors.hero.alive || !this.actors.king.alive) {
                        this.failedSkillChallenge = true;
                    }
                }
            }
        }

        render(): void {
            if (!this.done) {
                /*this.actors.render();
                OccupiedGrid.render();*/

                this.projectiles.render();
            }
        }

        private showVictoryAnimation() {
            if (this.done) {
                return;
            }

            this.done = true;

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
                    this.game.time.events.add(30000,() => {
                        this.actors.destroy(true);
                        this.game.state.start(States.Boot, true, false);
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

        private showFailureAnimation() {
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
                            this.actors.destroy(true);
                            this.game.state.start(States.Boot, true, false);
                        });
                        finalTween.start();
                    }, this);
                });
                fadeTween.start();

                fadeSprite.bringToTop();
                failureSprite.bringToTop();
            }, this);
        }

        private formatTime(timeMs: number): string {
            var date = new Date(timeMs);

            return this.pad(date.getMinutes(), 1, '0') + ':' + this.pad(date.getSeconds(), 2, '0');
        }

        private pad(n, width, z): string {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

        /**
         *  Manually sort the world sprites by their 'y' index. This relies on being called repeatedly (once per frame) in order
         * to fully sort the sprites and also to make sure they are sorted by their 'y' position correctly.
         */
        private sortSprites() {
            var children = this.world.children,
                len: number = children.length;

            if (this.done) {
                return;
            }

            // TODO: we should avoid doing this so often
            for (var i = 0; i < len; ++i) {
                var child1 = children[i];
                if (child1 instanceof Phaser.Sprite) {
                    var y1 = child1.y;
                    for (var j = i + 1; j < len; ++j) {
                        var child2 = children[j];
                        if (child2 instanceof Phaser.Sprite) {
                            var y2 = child2.y;

                            var renderPriority1 = (<any>child1).renderPriority || 0;
                            var renderPriority2 = (<any>child2).renderPriority || 0;

                            if (renderPriority2 < renderPriority1) {
                                children[i] = child2;
                                children[j] = child1;
                                break;
                            }

                            if (renderPriority1 === renderPriority2) {
                                /*if (child2.key === 'black') {
                                    children[i] = child2;
                                    children[j] = child1;
                                    break;
                                }

                                if ((child1.key === 'healthbar' || child1.key === 'healthbar_frame') &&
                                    child2.key !== 'healthbar' && child2.key !== 'healthbar_frame') {
                                    children[i] = child2;
                                    children[j] = child1;
                                    break;
                                }*/

                                if (y2 < y1) {
                                    children[i] = child2;
                                    children[j] = child1;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        private handleMouseClicked(x: number, y: number) {
            if (this.skillChallengeMode) {
                return;
            }

            var tile: Phaser.Point = <Phaser.Point>this.map.fromPixels(new Phaser.Point(x, y));
            var position = (<Phaser.Point>this.map.toPixels(tile)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);

            if (OccupiedGrid.canOccupyInPixels(null, position.x, position.y)) {
                this.actors.createMercenary(position.x, position.y, 'tank_merc');
            }
        }

        private handleProjectileCollision(projectile: FiredProjectile, sprite: Enemy) {
            if (projectile.dead) {
                return;
            }

            projectile.attachTo(sprite);
            sprite.inflictDamage(projectile.power, projectile.firedBy);
        }
    }
}