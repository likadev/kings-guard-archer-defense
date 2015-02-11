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
        }

        update(): void {
            var info = GameInfo.CurrentGame;
            var projectiles = info.projectiles;

            projectiles.update();

            this.game.physics.arcade.collide(this.hero, [this.king, this.enemyGenerator.enemies, this.map.collisionLayer]);
            this.game.physics.arcade.collide(projectiles.getActiveProjectiles(), this.enemyGenerator.enemies,(first, second) => {
                this.handleProjectileCollision(first, second);
            });

            this.hero.update();
            this.king.update();
            
            var enemies = this.enemyGenerator.enemies;
            for (var i = 0, l = enemies.length; i < l; ++i) {
                enemies[i].update();
            }
        }

        render(): void {
            
        }

        private handleProjectileCollision(projectile: FiredProjectile, sprite: Enemy) {
            //sprite.attach(projectile);
            projectile.attachTo(sprite);
            sprite.damage(projectile.power);
        }
    }
}