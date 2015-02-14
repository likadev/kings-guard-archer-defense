// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameSimulationState extends Phaser.State {
        private map: GameMap;
        private sprites: {};
        private enemyGenerator: EnemyGenerator;
        private hero: Hero;
        private king: AnimatedSprite;

        constructor() {
            super();
        }

        init(args: any[]) {
            this.map = args[0];
            this.sprites = args[1];
            this.enemyGenerator = args[2];

            this.hero = this.sprites['hero_spritesheet'];
            this.king = this.sprites['king'];
        }

        preload(): void {
            this.hero.weapon.preload();

            GameInfo.create(this.king, this.hero);
            GameInfo.CurrentGame.enemies = this.enemyGenerator;
        }

        create(): void {
            this.map.create();

            var heroPos = (<Phaser.Point>this.map.toPixels(this.map.heroSpawnPoint)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
            var kingPos = (<Phaser.Point>this.map.toPixels(this.map.kingSpawnPoint)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);

            this.hero.position.set(heroPos.x, heroPos.y);
            this.king.position.set(kingPos.x, kingPos.y);

            for (var spriteKey in this.sprites) {
                if (this.sprites.hasOwnProperty(spriteKey)) {
                    var sprite = this.sprites[spriteKey];
                    if (sprite instanceof Enemy) {
                        continue;
                    }

                    if (typeof sprite.init === 'function') {
                        sprite.init();
                    }

                    if (typeof sprite.addToWorld === 'function') {
                        sprite.addToWorld();
                    }
                }
            }

            var enemySpawns = this.map.enemySpawns;
            for (var i = 0, l = enemySpawns.length; i < l; ++i) {
                enemySpawns[i] = (<Phaser.Point>this.map.toPixels(enemySpawns[i])).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
            }

            this.enemyGenerator.create('enemy', enemySpawns[0].x, enemySpawns[0].y);
            this.enemyGenerator.create('enemy', enemySpawns[1].x, enemySpawns[1].y);

            var spawnEnemy = null;
            spawnEnemy = () => {
                var idx = this.game.rnd.integerInRange(0, enemySpawns.length - 1);
                var nextSpawnTime = 3000;
                if (this.enemyGenerator.enemies.length <= 1) {
                    nextSpawnTime = 500;
                }

                this.enemyGenerator.create('enemy', enemySpawns[idx].x, enemySpawns[idx].y);

                this.game.time.events.add(3000, spawnEnemy, this);
            }

            this.game.time.events.add(5000, spawnEnemy, this);
        }

        update(): void {
            var info = GameInfo.CurrentGame;
            var projectiles = info.projectiles;

            projectiles.update();

            var physics = this.game.physics.arcade;

            physics.collide(this.hero, [this.king, this.map.collisionLayer]);
            physics.collide(this.hero, this.enemyGenerator.enemies);
            physics.collide(projectiles.getActiveProjectiles(), this.enemyGenerator.enemies,(first, second) => {
                this.handleProjectileCollision(first, second);
            });
            physics.collide(this.enemyGenerator.enemies, this.enemyGenerator.enemies);
            physics.collide(this.enemyGenerator.enemies, this.map.collisionLayer);

            this.hero.update();
            this.king.update();

            this.enemyGenerator.update();
            
            var enemies = this.enemyGenerator.enemies;
            for (var i = 0, l = enemies.length; i < l; ++i) {
                enemies[i].update();
            }

            if (!this.king.alive) {
                this.game.state.start(States.Boot, true, false);
            }
        }

        render(): void {
            var enemies = this.enemyGenerator.enemies;
            for (var i = 0, l = enemies.length; i < l; ++i) {
                enemies[i].render();
            }

            this.hero.render();

            this.map.debugRenderOccupiedGrid();
            this.map.pathfinder.render();
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