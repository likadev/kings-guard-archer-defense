// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class SimulationController extends GameController {
        protected waveInProgress: boolean;

        init(context: GameContext) {
            super.init(context);

            this.waveInProgress = false;
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
                        console.log('[' + (++spawnCounter).toString() + '] spawn ' + enemyType + ' at (' + position.x + ', ' + position.y + ')');
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
                    AnimationHelper.createTextPopup("PROTECT YOUR KING");
                    if (!this.skillChallengeMode) {
                        AnimationHelper.createTextSubPopup("WAVE " + this.script.waveIndex);
                    }
                }, this);
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

            if (this.game.input.activePointer.isDown) {
                var x = this.game.input.activePointer.worldX;
                var y = this.game.input.activePointer.worldY;
                this.handleMouseClicked(x, y);
            }

            if (this.waveInProgress) {
                if (!this.script.waveInProgress && this.actors.enemies.length === 0) {
                    console.log('wave complete!');
                    this.waveInProgress = false;

                    this.switchTo('PrepareDefenseController');
                    return;
                }
            }

            if (!this.hero.alive) {
                (<any>this.game.camera).unfollow();
                this.game.camera.focusOnXY(this.king.x, this.king.y);
            }

            if (!actors.king.alive && !this.skillChallengeMode) {
                this.done = true;
            }
        }

        destroy() {
            super.destroy();
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

            if (OccupiedGrid.canOccupyInPixels(null, position.x, position.y)) {
                this.actors.createMercenary(position.x, position.y, 'tank_merc');
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