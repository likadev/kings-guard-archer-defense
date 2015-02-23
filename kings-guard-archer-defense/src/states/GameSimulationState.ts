// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameSimulationState extends Phaser.State {
        private map: GameMap;

        public actors: Actors;
        public projectiles: ProjectileManager;
        public sprites: {};
        private done: boolean = false;

        constructor() {
            super();
        }

        init(args: any[]) {
            Game.Simulation = this;

            this.map = args[0];
            this.sprites = args[1];

            this.done = false;
        }

        preload(): void {
            this.actors = new Actors(this.game, this.map);
        }

        create(): void {
            this.map.create();

            this.projectiles = new ProjectileManager();

            OccupiedGrid.reset();

            this.actors.createKing();
            var hero = this.actors.createHero();

            var camera = this.game.camera;
            camera.follow(hero, Phaser.Camera.FOLLOW_LOCKON);
            camera.setBoundsToWorld();
            camera.roundPx = true;

            this.actors.createEnemies('enemy', 2);

            var spawnEnemy = null;
            spawnEnemy = () => {
                if (this.done) {
                    return;
                }

                var nextSpawnTime = 3000;
                var numberOfEnemies = this.actors.enemies.length;
                var creationCount = 1;

                if (numberOfEnemies === 0) {
                    nextSpawnTime = 0;
                }
                else if (numberOfEnemies <= 1) {
                    nextSpawnTime = 500;
                }
                else if (numberOfEnemies <= 5) {
                    nextSpawnTime = 1500;
                }

                var spawn = this.actors.peekNextSpawnPoint();

                var rect = new Phaser.Rectangle(spawn.x - 16, spawn.y - 16, 32, 32);
                var occupants = OccupiedGrid.getOccupantsInBounds(rect);
                if (occupants.length > 0) {
                    nextSpawnTime = 250;
                }
                else {
                    this.actors.createEnemy('enemy');
                }

                this.game.time.events.add(nextSpawnTime, spawnEnemy, this);
            }

            this.game.time.events.add(5000, spawnEnemy, this);
        }

        preUpdate(): void {
            //this.hero.preUpdate();
        }

        update(): void {
            if (this.input.keyboard.isDown(Phaser.Keyboard.L)) {
                this.game.camera.x += 5;
            }
            else if (this.input.keyboard.isDown(Phaser.Keyboard.J)) {
                this.game.camera.x -= 5;
            }

            if (this.input.keyboard.isDown(Phaser.Keyboard.I)) {
                this.game.camera.y -= 5;
            }
            else if (this.input.keyboard.isDown(Phaser.Keyboard.K)) {
                this.game.camera.y += 5;
            }

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

            if (!actors.king.alive) {
                this.done = true;
                this.actors.destroy(true);
                this.game.state.start(States.Boot, true, false);
            }
        }

        render(): void {
            if (!this.done) {
                this.actors.render();
                //OccupiedGrid.render();
            }
        }

        private handleMouseClicked(x: number, y: number) {
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