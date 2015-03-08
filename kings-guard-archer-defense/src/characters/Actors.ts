// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class Actors extends Phaser.Group {
        private _map: GameMap;
        private _hero: Hero;
        private _king: King;
        private _enemies: Enemy[];
        private _mercenaries: Mercenary[];
        private _spawnPoints: Phaser.Point[];

        constructor(game: Phaser.Game, map: GameMap) {
            super(game, null, 'actors', true, true, Phaser.Physics.ARCADE);

            this.fixedToCamera = false;

            this._map = map;
            this._enemies = [];
            this._mercenaries = [];
            this._spawnPoints = [];

            var loopEvent: Phaser.TimerEvent = null;
            loopEvent = this.game.time.events.loop(1000,() => {
                if (this.exists && this.game != null && this.alive) {
                    this.forEachMercenary((merc) => {
                        if (merc.alive) {
                            this.forEachEnemy((enemy) => {
                                if (enemy.alive) {
                                    merc.checkThreatAgainst(enemy);
                                }
                            }, this);
                        }
                        }, this);
                }
                else {
                    this.game.time.events.remove(loopEvent);
                }
            }, this);
        }

        /**
         *  Gets the current game map.
         */
        public get map() {
            return this._map;
        }

        /**
         *  Gets the hero.
         */
        public get hero() {
            return this._hero;
        }

        /**
         *  Gets the king.
         */
        public get king() {
            return this._king;
        }

        /**
         *  Gets the enemies.
         */
        public get enemies() {
            return this._enemies;
        }

        /**
         *  Gets the active mercenaries.
         */
        public get mercenaries() {
            return this._mercenaries;
        }

        /**
         *  Creates and initializes a sprite.
         */
        public create(x: number, y: number, key: string, frame?: any, exists?: boolean, addToWorld: boolean = true): any {
            //var created = super.create(x, y, key, frame, exists);
            var activator = new AniamtedSpriteActivator(this.classType);
            var created: any = activator.getNew(this.game, x, y, key, frame);

            AnimationLoader.addAnimationToSprite(created, key);

            if (typeof created.init === 'function') {
                created.init();
            }

            if (typeof created.preload === 'function') {
                created.preload();
            }

            if (addToWorld && typeof created.addToWorld === 'function') {
                created.addToWorld();
            }

            //this.children.push(created);
            //this.add(created);

            return created;
        }

        /**
         *  Creates an actor of type Hero. Can only be created once.
         */
        public createHero(): Hero {
            if (this._hero != null) {
                throw new Error("'Hero' already created!");
            }

            var heroPos = (<Phaser.Point>this.map.toPixels(this.map.heroSpawnPoint)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);

            this.classType = Hero;
            this._hero = this.create(heroPos.x, heroPos.y, Hero.KEY);
            return this._hero;
        }

        /**
         *  Creates an actor of type King. Can only be created once.
         */
        public createKing(): King {
            if (this._king != null) {
                throw new Error("'King' already created!");
            }

            var kingPos = (<Phaser.Point>this.map.toPixels(this.map.kingSpawnPoint)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);

            this.classType = King;
            this._king = this.create(kingPos.x, kingPos.y, 'king');
            return this._king;
        }

        /**
         *  Creates an enemy and adds it to the list of enemies.
         */
        public createEnemy(key: string): Enemy {
            var position = this.getNextSpawnPoint();
            if (position == null) {
                return null;
            }

            this.classType = Enemy;
            var enemy: Enemy = this.create(position.x, position.y, key);
            enemy.position.set(position.x, position.y);
            this._enemies.push(enemy);
            return enemy;
        }

        /**
         *  Create multiple enemies at once.
         */
        public createEnemies(key: string, count: number): Enemy[] {
            var enemies: Enemy[] = [];

            for (var i = 0; i < count; ++i) {
                enemies.push(this.createEnemy(key));
            }

            return enemies;
        }

        /**
         *  Creates a mercenary and adds it to the list of mercenaries.
         */
        public createMercenary(x: number, y: number, mercType: MercenaryType): Mercenary {
            this.classType = Mercenary;
            var merc: Mercenary = <Mercenary>this.create(x, y, mercType.key, null, null, false);

            merc.health = mercType.baseHealth;
            merc.canMove = mercType.canMove;
            merc.canPerch = mercType.canPerch;
            merc.isRanged = mercType.ranged;
            merc.engageRange = mercType.engageRange;
            merc.weapon.key = mercType.weapon.key;
            merc.weapon.range = mercType.weapon.range;
            merc.weapon.cooldown = mercType.weapon.cooldown;
            merc.weapon.frontSwing = mercType.weapon.frontSwing;
            merc.weapon.backSwing = mercType.weapon.backSwing;
            merc.weapon.power = mercType.weapon.basePower;
            merc.weapon.projectileSpeed = mercType.weapon.projectileSpeed;

            merc.addToWorld();
            
            this._mercenaries.push(merc);
            return merc;
        }

        /**
         *  Remove an enemy from the list of enemies.
         */
        public kill(actor: Enemy|Mercenary): any {
            actor.kill();

            if (actor instanceof Enemy) {
                Arrays.remove(actor, this._enemies);
            }
            else if (actor instanceof Mercenary) {
                Arrays.remove(actor, this._mercenaries);
            }

            return this;
        }

        /**
         *  Loop through each enemy and send it through the callback.
         */
        public forEachEnemy(callback: (enemy: Enemy, ...args: any[]) => any, callbackContext: any, checkExists: boolean = false, ...args: any[]) {
            for (var i = 0, l = this._enemies.length; i < l; ++i) {
                var enemy = this._enemies[i];

                if (checkExists) {
                    if (!enemy.alive || !enemy.exists) {
                        continue;
                    }
                }

                callback.apply(callbackContext, [enemy]);
            }
        }

        /**
         *  Loop through each mercenary and send it through the callback.
         */
        public forEachMercenary(callback: (merc: Mercenary, ...args: any[]) => any, callbackContext: any, checkExists: boolean = false, ...args: any[]) {
            for (var i = 0, l = this._mercenaries.length; i < l; ++i) {
                var merc = this._mercenaries[i];

                if (checkExists) {
                    if (!merc.alive || !merc.exists) {
                        continue;
                    }
                }

                callback.apply(callbackContext, [merc]);
            }
        }

        update(): void {
            var physics = this.game.physics.arcade;

            physics.overlap(this.hero, this.map.collisionLayer);

            this.removeDeadActors(this._mercenaries);
            this.removeDeadActors(this._enemies);

            this.sort('y', Phaser.Group.SORT_ASCENDING);
            super.update();

            
        }

        render(): void {
            var renderActor = (sprite) => {
                if (typeof sprite.render === 'function') {
                    sprite.render();
                }
            }

            this.forEachEnemy((enemy) => { renderActor(enemy); }, this);
            this.forEachMercenary((merc) => { renderActor(merc); }, this);
        }

        /**
         *  Peek at the next enemy spawn point without popping it.
         */
        public peekNextSpawnPoint(): Phaser.Point {
            if (this._spawnPoints.length === 0) {
                this.createSpawnPoints();
            }

            var spawnPoint = this._spawnPoints[this._spawnPoints.length - 1];
            var position = (<Phaser.Point>this.map.toPixels(spawnPoint)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
            return position;
        }

        /**
         *  Remove any dead actors from the list of actors.
         */
        private removeDeadActors<T extends AnimatedSprite>(actors: T[]) {
            var len = actors.length;
            if (len === 0) {
                return;
            }

            var removeList: T[] = [];

            for (var i = 0, l = len; i < l; ++i) {
                var actor = actors[i];
                if (!actor.exists) {
                    removeList.push(actor);
                }
            }

            for (i = 0, l = removeList.length; i < l; ++i) {
                var deadActor = removeList[i];
                var idx = $.inArray(deadActor, actors);
                actors.splice(idx, 1);

                this.remove(deadActor, true);
            }
        }

        /**
         *  Gets the next random enemy spawn point.
         */
        private getNextSpawnPoint(): Phaser.Point {
            var ready = false;

            var firstTry: Phaser.Point = null;

            while (!ready) {
                if (this._spawnPoints.length === 0) {
                    this.createSpawnPoints();
                }

                var position = (<Phaser.Point>this.map.toPixels(this._spawnPoints.pop())).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
                if (firstTry == null) {
                    firstTry = position;
                }
                else if (position.equals(firstTry)) {
                    return null;
                }

                if (OccupiedGrid.canOccupyInPixels(null, position)) {
                    ready = true;
                }
            }

            return position;
        }

        /**
         *  Creates new, shuffled enemy spawn points.
         */
        private createSpawnPoints() {
            this._spawnPoints = this.map.enemySpawns.slice(0);
            Arrays.shuffle(this._spawnPoints);
            return this._spawnPoints;
        }
    }
}