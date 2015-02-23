// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KGAD;
(function (KGAD) {
    var BootState = (function (_super) {
        __extends(BootState, _super);
        function BootState() {
            _super.apply(this, arguments);
        }
        BootState.prototype.init = function () {
        };
        BootState.prototype.preload = function () {
        };
        BootState.prototype.create = function () {
            this.input.maxPointers = 1;
            this.game.physics.enable(Phaser.Physics.ARCADE);
        };
        BootState.prototype.update = function () {
            var states = KGAD.States.Instance;
            states.switchTo(KGAD.States.MainMenu);
        };
        return BootState;
    })(Phaser.State);
    KGAD.BootState = BootState;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var MainMenuState = (function (_super) {
        __extends(MainMenuState, _super);
        function MainMenuState() {
            _super.call(this);
        }
        MainMenuState.prototype.preload = function () {
            this.map = new KGAD.GameMap("level_1");
            KGAD.Game.CurrentMap = this.map;
        };
        MainMenuState.prototype.create = function () {
        };
        MainMenuState.prototype.update = function () {
            if (this.map.ready) {
                var states = KGAD.States.Instance;
                states.switchTo(KGAD.States.PreGameLoading, true, false, this.map);
            }
        };
        return MainMenuState;
    })(Phaser.State);
    KGAD.MainMenuState = MainMenuState;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var PreGameLoadingState = (function (_super) {
        __extends(PreGameLoadingState, _super);
        function PreGameLoadingState() {
            _super.call(this);
        }
        PreGameLoadingState.prototype.init = function (args) {
            this.map = args[0];
        };
        PreGameLoadingState.prototype.preload = function () {
            var _this = this;
            this.sprites = [];
            this.map.preload();
            var spritesheets = [
                KGAD.Hero.KEY,
                'king',
                'enemy',
                'tank_merc',
            ];
            var total = spritesheets.length;
            var itemsToLoad = total;
            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === KGAD.Hero.KEY;
                var isEnemy = name === 'enemy';
                var isKing = name === 'king';
                var isMerc = name === 'tank_merc';
                var callback = function (sprite) {
                    _this.sprites[sprite.key] = sprite;
                    --itemsToLoad;
                    if (itemsToLoad <= 0) {
                        _this.ready = true;
                    }
                };
                KGAD.AnimationLoader.load(name, callback, isHero ? KGAD.Hero : isEnemy ? KGAD.Enemy : isKing ? KGAD.King : isMerc ? KGAD.Mercenary : KGAD.AnimatedSprite);
            }
            KGAD.AnimationLoader.load('charge', function (s) {
                _this.chargeSprite = s;
            }, KGAD.BowCharge, 'assets/textures/weapons/');
        };
        PreGameLoadingState.prototype.create = function () {
        };
        PreGameLoadingState.prototype.update = function () {
            var states = KGAD.States.Instance;
            if (KGAD.AnimationLoader.done && this.ready) {
                states.switchTo(KGAD.States.GameSimulation, true, false, this.map, this.sprites);
            }
        };
        return PreGameLoadingState;
    })(Phaser.State);
    KGAD.PreGameLoadingState = PreGameLoadingState;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var GameSimulationState = (function (_super) {
        __extends(GameSimulationState, _super);
        function GameSimulationState() {
            _super.call(this);
            this.done = false;
        }
        GameSimulationState.prototype.init = function (args) {
            KGAD.Game.Simulation = this;
            this.map = args[0];
            this.sprites = args[1];
            this.done = false;
        };
        GameSimulationState.prototype.preload = function () {
            this.actors = new KGAD.Actors(this.game, this.map);
        };
        GameSimulationState.prototype.create = function () {
            var _this = this;
            this.map.create();
            this.projectiles = new KGAD.ProjectileManager();
            KGAD.OccupiedGrid.reset();
            this.actors.createKing();
            var hero = this.actors.createHero();
            var camera = this.game.camera;
            camera.follow(hero, Phaser.Camera.FOLLOW_LOCKON);
            camera.setBoundsToWorld();
            camera.roundPx = true;
            this.actors.createEnemies('enemy', 2);
            var spawnEnemy = null;
            spawnEnemy = function () {
                if (_this.done) {
                    return;
                }
                var nextSpawnTime = 3000;
                var numberOfEnemies = _this.actors.enemies.length;
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
                var spawn = _this.actors.peekNextSpawnPoint();
                var rect = new Phaser.Rectangle(spawn.x - 16, spawn.y - 16, 32, 32);
                var occupants = KGAD.OccupiedGrid.getOccupantsInBounds(rect);
                if (occupants.length > 0) {
                    nextSpawnTime = 250;
                }
                else {
                    _this.actors.createEnemy('enemy');
                }
                _this.game.time.events.add(nextSpawnTime, spawnEnemy, _this);
            };
            this.game.time.events.add(5000, spawnEnemy, this);
        };
        GameSimulationState.prototype.preUpdate = function () {
            //this.hero.preUpdate();
        };
        GameSimulationState.prototype.update = function () {
            var _this = this;
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
            physics.collide(projectiles.getActiveProjectiles(), this.actors.enemies, function (first, second) {
                _this.handleProjectileCollision(first, second);
            });
            if (this.game.input.activePointer.isDown) {
                var x = this.game.input.activePointer.worldX;
                var y = this.game.input.activePointer.worldY;
                this.handleMouseClicked(x, y);
            }
            if (!actors.king.alive) {
                this.done = true;
                this.actors.destroy(true);
                this.game.state.start(KGAD.States.Boot, true, false);
            }
        };
        GameSimulationState.prototype.render = function () {
            if (!this.done) {
                this.actors.render();
            }
        };
        GameSimulationState.prototype.handleMouseClicked = function (x, y) {
            var tile = this.map.fromPixels(new Phaser.Point(x, y));
            var position = this.map.toPixels(tile).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            if (KGAD.OccupiedGrid.canOccupyInPixels(null, position.x, position.y)) {
                this.actors.createMercenary(position.x, position.y, 'tank_merc');
            }
        };
        GameSimulationState.prototype.handleProjectileCollision = function (projectile, sprite) {
            if (projectile.dead) {
                return;
            }
            projectile.attachTo(sprite);
            sprite.inflictDamage(projectile.power, projectile.firedBy);
        };
        return GameSimulationState;
    })(Phaser.State);
    KGAD.GameSimulationState = GameSimulationState;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../../definitions/phaser.d.ts" />
/// <reference path="BootState.ts" />
/// <reference path="MainMenuState.ts" />
/// <reference path="PreGameLoadingState.ts" />
/// <reference path="GameSimulationState.ts" />
var KGAD;
(function (KGAD) {
    var States = (function () {
        function States() {
            States.instance = this;
        }
        Object.defineProperty(States, "Boot", {
            get: function () {
                return 'Boot';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(States, "MainMenu", {
            get: function () {
                return 'MainMenu';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(States, "PreGameLoading", {
            get: function () {
                return 'PreGameLoading';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(States, "GameSimulation", {
            get: function () {
                return 'GameSimulation';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(States, "Instance", {
            get: function () {
                return this.instance;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Initially sets up new states and adds them to Phaser.
         */
        States.prototype.setUpStates = function () {
            var game = KGAD.Game.Instance;
            game.state.add(States.Boot, KGAD.BootState, false);
            game.state.add(States.Boot, KGAD.MainMenuState, false);
            game.state.add(States.PreGameLoading, KGAD.PreGameLoadingState, false);
            game.state.add(States.GameSimulation, KGAD.GameSimulationState, false);
        };
        /**
         * Switches to the given state.
         */
        States.prototype.switchTo = function (key, clearWorld, clearCache) {
            if (clearWorld === void 0) { clearWorld = false; }
            if (clearCache === void 0) { clearCache = false; }
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var game = KGAD.Game.Instance;
            game.state.start(key, clearWorld, clearCache, args);
        };
        States.instance = null;
        return States;
    })();
    KGAD.States = States;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../definitions/phaser.d.ts" />
/// <reference path="states/States.ts" />
var KGAD;
(function (KGAD) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game(width, height, container) {
            _super.call(this, width, height, Phaser.AUTO, container);
            if (Game.instance != null) {
                throw Error('Cannot create more than one \'Game\' instance!');
            }
            Game.instance = this;
            var states = new KGAD.States();
            states.setUpStates();
            states.switchTo(KGAD.States.Boot);
        }
        Object.defineProperty(Game, "Instance", {
            /**
             *  Gets the current game instance.
             */
            get: function () {
                return Game.instance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "CurrentMap", {
            /**
             *  Gets the current map.
             */
            get: function () {
                return Game.currentMap;
            },
            /**
             *  Sets the current map.
             */
            set: function (map) {
                this.currentMap = map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "Simulation", {
            /**
             *  Gets the current game simulation state.
             */
            get: function () {
                return this.simulation;
            },
            /**
             *  Sets the current game simulation state.
             */
            set: function (simulation) {
                this.simulation = simulation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "Actors", {
            /**
             *  Gets the actors in the current game simulation.
             */
            get: function () {
                return this.simulation == null ? null : this.simulation.actors;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "Hero", {
            /**
             *  Gets the player/hero unit.
             */
            get: function () {
                return this.Actors == null ? null : this.Actors.hero;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "King", {
            /**
             *  Gets the king unit.
             */
            get: function () {
                return this.Actors == null ? null : this.Actors.king;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "Mercenaries", {
            /**
             *  Gets all active mercenaries in the current simulation.
             */
            get: function () {
                return this.Actors == null ? [] : this.Actors.mercenaries;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "Enemies", {
            /**
             *  Gets all enemies in the current simulation.
             */
            get: function () {
                return this.Actors == null ? [] : this.Actors.enemies;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "Projectiles", {
            /**
             *  Gets the projectile manager.
             */
            get: function () {
                return this.Simulation == null ? null : this.Simulation.projectiles;
            },
            enumerable: true,
            configurable: true
        });
        Game.instance = null;
        Game.currentMap = null;
        Game.actors = null;
        Game.simulation = null;
        return Game;
    })(Phaser.Game);
    KGAD.Game = Game;
})(KGAD || (KGAD = {}));
window.onload = function () {
    try {
        $('#content').html('');
        var game = new KGAD.Game(640, 640, 'content');
    }
    finally {
    }
};
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var Actors = (function (_super) {
        __extends(Actors, _super);
        function Actors(game, map) {
            var _this = this;
            _super.call(this, game, null, 'actors', true, true, Phaser.Physics.ARCADE);
            this.fixedToCamera = false;
            this._map = map;
            this._enemies = [];
            this._mercenaries = [];
            this._spawnPoints = [];
            var checkThreat = null;
            checkThreat = function () {
                if (_this.exists && _this.game != null) {
                    _this.forEachMercenary(function (merc) {
                        _this.forEachEnemy(function (enemy) {
                            merc.checkThreatAgainst(enemy);
                        }, _this);
                    }, _this);
                    _this.game.time.events.add(1000, function () {
                        checkThreat();
                    }, _this);
                }
            };
            this.game.time.events.add(1000, function () {
                checkThreat();
            }, this);
        }
        Object.defineProperty(Actors.prototype, "map", {
            /**
             *  Gets the current game map.
             */
            get: function () {
                return this._map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actors.prototype, "hero", {
            /**
             *  Gets the hero.
             */
            get: function () {
                return this._hero;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actors.prototype, "king", {
            /**
             *  Gets the king.
             */
            get: function () {
                return this._king;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actors.prototype, "enemies", {
            /**
             *  Gets the enemies.
             */
            get: function () {
                return this._enemies;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actors.prototype, "mercenaries", {
            /**
             *  Gets the active mercenaries.
             */
            get: function () {
                return this._mercenaries;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Creates and initializes a sprite.
         */
        Actors.prototype.create = function (x, y, key, frame, exists) {
            //var created = super.create(x, y, key, frame, exists);
            var activator = new KGAD.AniamtedSpriteActivator(this.classType);
            var created = activator.getNew(this.game, x, y, key, frame);
            KGAD.AnimationLoader.addAnimationToSprite(created, key);
            if (typeof created.init === 'function') {
                created.init();
            }
            if (typeof created.preload === 'function') {
                created.preload();
            }
            if (typeof created.addToWorld === 'function') {
                created.addToWorld();
            }
            //this.add(created);
            return created;
        };
        /**
         *  Creates an actor of type Hero. Can only be created once.
         */
        Actors.prototype.createHero = function () {
            if (this._hero != null) {
                throw new Error("'Hero' already created!");
            }
            var heroPos = this.map.toPixels(this.map.heroSpawnPoint).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            this.classType = KGAD.Hero;
            this._hero = this.create(heroPos.x, heroPos.y, KGAD.Hero.KEY);
            return this._hero;
        };
        /**
         *  Creates an actor of type King. Can only be created once.
         */
        Actors.prototype.createKing = function () {
            if (this._king != null) {
                throw new Error("'King' already created!");
            }
            var kingPos = this.map.toPixels(this.map.kingSpawnPoint).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            this.classType = KGAD.King;
            this._king = this.create(kingPos.x, kingPos.y, 'king');
            return this._king;
        };
        /**
         *  Creates an enemy and adds it to the list of enemies.
         */
        Actors.prototype.createEnemy = function (key) {
            var position = this.getNextSpawnPoint();
            if (position == null) {
                return null;
            }
            this.classType = KGAD.Enemy;
            var enemy = this.create(position.x, position.y, key);
            this._enemies.push(enemy);
            return enemy;
        };
        /**
         *  Create multiple enemies at once.
         */
        Actors.prototype.createEnemies = function (key, count) {
            var enemies = [];
            for (var i = 0; i < count; ++i) {
                enemies.push(this.createEnemy(key));
            }
            return enemies;
        };
        /**
         *  Creates a mercenary and adds it to the list of mercenaries.
         */
        Actors.prototype.createMercenary = function (x, y, key) {
            this.classType = KGAD.Mercenary;
            var merc = this.create(x, y, key);
            this._mercenaries.push(merc);
            return merc;
        };
        /**
         *  Remove an enemy from the list of enemies.
         */
        Actors.prototype.kill = function (actor) {
            actor.kill();
            if (actor instanceof KGAD.Enemy) {
                KGAD.Arrays.remove(actor, this._enemies);
            }
            else if (actor instanceof KGAD.Mercenary) {
                KGAD.Arrays.remove(actor, this._mercenaries);
            }
            return this;
        };
        /**
         *  Loop through each enemy and send it through the callback.
         */
        Actors.prototype.forEachEnemy = function (callback, callbackContext, checkExists) {
            if (checkExists === void 0) { checkExists = false; }
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            for (var i = 0, l = this._enemies.length; i < l; ++i) {
                var enemy = this._enemies[i];
                if (checkExists) {
                    if (!enemy.alive || !enemy.exists) {
                        continue;
                    }
                }
                callback.apply(callbackContext, [enemy]);
            }
        };
        /**
         *  Loop through each mercenary and send it through the callback.
         */
        Actors.prototype.forEachMercenary = function (callback, callbackContext, checkExists) {
            if (checkExists === void 0) { checkExists = false; }
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            for (var i = 0, l = this._mercenaries.length; i < l; ++i) {
                var merc = this._mercenaries[i];
                if (checkExists) {
                    if (!merc.alive || !merc.exists) {
                        continue;
                    }
                }
                callback.apply(callbackContext, [merc]);
            }
        };
        Actors.prototype.update = function () {
            var physics = this.game.physics.arcade;
            physics.overlap(this.hero, this.map.collisionLayer);
            this.removeDeadActors(this._mercenaries);
            this.removeDeadActors(this._enemies);
            _super.prototype.update.call(this);
            this.sort('y', Phaser.Group.SORT_ASCENDING);
        };
        Actors.prototype.render = function () {
            var renderActor = function (sprite) {
                if (typeof sprite.render === 'function') {
                    sprite.render();
                }
            };
            this.forEachEnemy(function (enemy) {
                renderActor(enemy);
            }, this);
            this.forEachMercenary(function (merc) {
                renderActor(merc);
            }, this);
        };
        /**
         *  Peek at the next enemy spawn point without popping it.
         */
        Actors.prototype.peekNextSpawnPoint = function () {
            if (this._spawnPoints.length === 0) {
                this.createSpawnPoints();
            }
            var spawnPoint = this._spawnPoints[this._spawnPoints.length - 1];
            var position = this.map.toPixels(spawnPoint).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            return position;
        };
        /**
         *  Remove any dead actors from the list of actors.
         */
        Actors.prototype.removeDeadActors = function (actors) {
            var len = actors.length;
            if (len === 0) {
                return;
            }
            var removeList = [];
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
        };
        /**
         *  Gets the next random enemy spawn point.
         */
        Actors.prototype.getNextSpawnPoint = function () {
            var ready = false;
            var firstTry = null;
            while (!ready) {
                if (this._spawnPoints.length === 0) {
                    this.createSpawnPoints();
                }
                var position = this.map.toPixels(this._spawnPoints.pop()).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
                if (firstTry == null) {
                    firstTry = position;
                }
                else if (position.equals(firstTry)) {
                    return null;
                }
                if (KGAD.OccupiedGrid.canOccupyInPixels(null, position)) {
                    ready = true;
                }
            }
            return position;
        };
        /**
         *  Creates new, shuffled enemy spawn points.
         */
        Actors.prototype.createSpawnPoints = function () {
            this._spawnPoints = this.map.enemySpawns.slice(0);
            KGAD.Arrays.shuffle(this._spawnPoints);
            return this._spawnPoints;
        };
        return Actors;
    })(Phaser.Group);
    KGAD.Actors = Actors;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var Alliance = (function () {
        function Alliance() {
        }
        Object.defineProperty(Alliance, "Ally", {
            get: function () {
                return "ally";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Alliance, "Enemy", {
            get: function () {
                return "enemy";
            },
            enumerable: true,
            configurable: true
        });
        return Alliance;
    })();
    KGAD.Alliance = Alliance;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var Actions = (function () {
        function Actions() {
        }
        Object.defineProperty(Actions, "Standing", {
            get: function () {
                return 'face';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actions, "Moving", {
            get: function () {
                return 'walk';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actions, "Charging", {
            get: function () {
                return 'charge';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actions, "Firing", {
            get: function () {
                return 'fire';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actions, "Casting", {
            get: function () {
                return 'cast';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actions, "Damaged", {
            get: function () {
                return 'damaged';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actions, "Dying", {
            get: function () {
                return 'dying';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actions, "Dead", {
            get: function () {
                return 'dead';
            },
            enumerable: true,
            configurable: true
        });
        return Actions;
    })();
    KGAD.Actions = Actions;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="./Actions.ts" />
var KGAD;
(function (KGAD) {
    var AnimationHelper = (function () {
        function AnimationHelper() {
        }
        /**
         *  Gets an animation based on a sprite's action and direction.
         */
        AnimationHelper.getAnimationFromAction = function (action, direction) {
            var dir = parseInt(direction, 10);
            var dirName = null;
            switch (dir) {
                case 0 /* Up */:
                    dirName = "up";
                    break;
                case 1 /* Left */:
                    dirName = "left";
                    break;
                case 2 /* Down */:
                    dirName = "down";
                    break;
                case 3 /* Right */:
                    dirName = "right";
                    break;
            }
            var animationName = action + (dirName != null ? "_" + dirName : "");
            return animationName;
        };
        /**
         *  Based on a sprite's action/direction, return the animation name.
         */
        AnimationHelper.getCurrentAnimation = function (sprite) {
            return AnimationHelper.getAnimationFromAction(sprite.action, sprite.direction);
        };
        /**
         *  Creates a tween that makes a sprite appear as if it's been damaged.
         */
        AnimationHelper.createDamageTween = function (obj) {
            var game = KGAD.Game.Instance;
            var tween = game.add.tween(obj).to({ tint: 0xFF3333 }, 35, Phaser.Easing.Cubic.InOut, false, 0, 2, true);
            obj.tint = 0xFFFFFF;
            return tween;
        };
        return AnimationHelper;
    })();
    KGAD.AnimationHelper = AnimationHelper;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../input/AnimationHelper.ts" />
var KGAD;
(function (KGAD) {
    var AnimatedSprite = (function (_super) {
        __extends(AnimatedSprite, _super);
        function AnimatedSprite(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            this.default_animation = 'face_down';
            this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            this.texture.baseTexture.mipmap = true;
            this.anchor.setTo(0.5);
            this.action = KGAD.Actions.Standing;
            this.direction = 2 /* Down */;
            this.added = false;
            this.canOccupy = true;
            this.isBlocked = false;
            this.blocked = new Phaser.Signal();
            this.movementTweenCompleted = new Phaser.Signal();
            this.pathFindingMover = new KGAD.PathMovementMachine(this);
            this.movementSpeed = 100;
            this.fixedToCamera = false;
        }
        AnimatedSprite.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.bounce.setTo(0.0);
            this.body.collideWorldBounds = true;
            this.body.immovable = true;
        };
        Object.defineProperty(AnimatedSprite.prototype, "canOccupyTiles", {
            get: function () {
                return this.canOccupy;
            },
            set: function (val) {
                this.canOccupy = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimatedSprite.prototype, "map", {
            get: function () {
                return KGAD.Game.CurrentMap;
            },
            enumerable: true,
            configurable: true
        });
        AnimatedSprite.prototype.preload = function () {
        };
        Object.defineProperty(AnimatedSprite.prototype, "weight", {
            get: function () {
                if (this.action === KGAD.Actions.Dying || this.action === KGAD.Actions.Dead) {
                    return 1;
                }
                return 2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimatedSprite.prototype, "alliance", {
            get: function () {
                return KGAD.Alliance.Ally;
            },
            enumerable: true,
            configurable: true
        });
        AnimatedSprite.prototype.addToWorld = function () {
            var _this = this;
            if (!this.added) {
                this.default_animation = KGAD.AnimationHelper.getCurrentAnimation(this);
                var animation = this.animations.getAnimation(this.default_animation);
                if (animation != null) {
                    this.animations.play(this.default_animation);
                }
                this.added = true;
            }
            this.lastPosition = this.position;
            this.tilePosition = new Phaser.Point(Math.floor(this.x / KGAD.GameMap.TILE_WIDTH), Math.floor(this.y / KGAD.GameMap.TILE_HEIGHT));
            this.lastTilePosition = new Phaser.Point(this.tilePosition.x, this.tilePosition.y);
            var addCallback = null;
            addCallback = function () {
                if (!KGAD.OccupiedGrid.canOccupyInPixels(_this, _this.position)) {
                    console.log('spawn point is occupied; waiting for it to free up');
                    _this.game.time.events.add(100, function () {
                        addCallback();
                    }, _this);
                }
                else {
                    KGAD.OccupiedGrid.add(_this);
                    _this.game.world.add(_this);
                }
            };
            addCallback();
        };
        AnimatedSprite.prototype.face = function (sprite) {
            var angle = this.game.physics.arcade.angleBetween(this.position, sprite.position);
            this.direction = KGAD.MovementHelper.getDirectionFromAngle(angle);
        };
        AnimatedSprite.prototype.updateAnimation = function (onComplete) {
            var animationName = KGAD.AnimationHelper.getCurrentAnimation(this);
            var currentAnimation = this.animations.currentAnim;
            if (animationName != null) {
                if (currentAnimation != null && animationName === currentAnimation.name) {
                    return;
                }
                var player = null;
                var animation = this.animations.getAnimation(animationName);
                if (animation != null) {
                    player = this.animations.play(animationName);
                }
                else {
                    this.action = KGAD.Actions.Moving;
                    animationName = KGAD.AnimationHelper.getCurrentAnimation(this);
                    animation = this.animations.getAnimation(animationName);
                    if (animation != null) {
                        player = this.animations.play(animationName);
                    }
                }
                if (onComplete) {
                    player.onComplete.addOnce(onComplete);
                }
            }
        };
        AnimatedSprite.prototype.inflictDamage = function (amount, source) {
            _super.prototype.damage.call(this, amount);
            if (this.health <= 0) {
                KGAD.OccupiedGrid.remove(this);
            }
            return this;
        };
        AnimatedSprite.prototype.kill = function () {
            this.pathFindingMover.currentPath = null;
            this.pathFindingMover = null;
            this.stopMovementTween();
            return _super.prototype.kill.call(this);
        };
        /**
         *  Stop the current movement tween if it's running.
         */
        AnimatedSprite.prototype.stopMovementTween = function (complete) {
            if (complete === void 0) { complete = false; }
            if (this.movementTween != null && this.movementTween.isRunning) {
                this.movementTween.stop(complete);
            }
            this.movementTween = null;
        };
        /**
         *  Gets whether or not a movement tween is in progress.
         */
        AnimatedSprite.prototype.isMoveTweening = function () {
            return this.movementTween != null && this.movementTween.isRunning;
        };
        /**
         *  Move to the given (x, y) coordinate.
         */
        AnimatedSprite.prototype.moveTweenTo = function (position) {
            var _this = this;
            var distance = Phaser.Point.distance(this.position, position);
            if (distance <= 0.0001) {
                setTimeout(function () {
                    _this.movementTweenCompleted.dispatch();
                }, 0);
                return false;
            }
            this.stopMovementTween();
            if (!KGAD.OccupiedGrid.canOccupyInPixels(this, position.x, position.y)) {
                return false;
            }
            var timeToMove = (distance / this.movementSpeed) * 1000.0;
            this.movementTween = this.game.add.tween(this).to(position, timeToMove, Phaser.Easing.Linear.None, false, 0);
            this.movementTween.onComplete.addOnce(function () {
                _this.movementTweenCompleted.dispatch();
            });
            this.movementTween.start();
            return true;
        };
        AnimatedSprite.prototype.preUpdate = function () {
            var map = KGAD.Game.CurrentMap;
            if (!this.alive || !this.exists || this.health <= 0) {
                _super.prototype.preUpdate.call(this);
                return;
            }
            if (this.canOccupyTiles) {
                var occupants = [];
                if (!KGAD.OccupiedGrid.canOccupyInPixels(this, this.position, null, occupants)) {
                    this.position = this.lastPosition;
                    if (this.body) {
                        this.body.velocity.setTo(0);
                    }
                    this.stopMovementTween();
                    this.isBlocked = true;
                    this.blocked.dispatch(occupants);
                }
                else {
                    this.isBlocked = false;
                }
                KGAD.OccupiedGrid.update(this);
            }
            this.tilePosition = map.fromPixels(this.position);
            this.lastPosition = new Phaser.Point(this.position.x, this.position.y);
            this.lastTilePosition = new Phaser.Point(this.tilePosition.x, this.tilePosition.y);
            _super.prototype.preUpdate.call(this);
        };
        AnimatedSprite.prototype.update = function () {
            _super.prototype.update.call(this);
        };
        AnimatedSprite.prototype.render = function () {
        };
        return AnimatedSprite;
    })(Phaser.Sprite);
    KGAD.AnimatedSprite = AnimatedSprite;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../../sprites/AnimatedSprite.ts" />
var KGAD;
(function (KGAD) {
    var BowCharge = (function (_super) {
        __extends(BowCharge, _super);
        function BowCharge(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
        }
        BowCharge.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.canOccupy = false;
            this.canOccupyTiles = false;
            KGAD.AnimationLoader.addAnimationToSprite(this, this.key);
        };
        return BowCharge;
    })(KGAD.AnimatedSprite);
    KGAD.BowCharge = BowCharge;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var Weapon = (function () {
        function Weapon(game, key, cooldown, projectileSpeed, power, aliveTime, chargeSprite) {
            if (projectileSpeed === void 0) { projectileSpeed = 0; }
            if (power === void 0) { power = 1; }
            if (aliveTime === void 0) { aliveTime = 5000; }
            if (chargeSprite === void 0) { chargeSprite = null; }
            this.game = game;
            this.key = key;
            this.cooldown = cooldown;
            this.projectileSpeed = projectileSpeed;
            this.power = power;
            this.aliveTime = aliveTime;
            this.chargeSprite = chargeSprite;
            this.frontSwing = 0;
            this.backSwing = 0;
            this.range = 32;
            this.lastFire = 0;
            this.charging = false;
            this.chargeTime = 0;
            this.minimumChargeTime = 150;
            this.fullChargeTime = 1000;
        }
        Weapon.prototype.preload = function () {
            if (!this.game.cache.checkImageKey(this.key)) {
                var url = 'assets/textures/weapons/' + this.key + '.png';
                this.game.load.image(this.key, url);
            }
            if (this.chargeSprite != null) {
                this.chargeSprite.canOccupyTiles = false;
                this.chargeSprite.preload();
                this.chargeSprite.init();
                this.chargeSprite.visible = false;
            }
        };
        Object.defineProperty(Weapon.prototype, "canFire", {
            get: function () {
                return this.game.time.now - this.lastFire > this.cooldown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Weapon.prototype, "lastFireTime", {
            set: function (time) {
                this.lastFire = time;
            },
            enumerable: true,
            configurable: true
        });
        Weapon.prototype.isBackSwinging = function () {
            var delta = this.game.time.now - this.lastFire;
            return !(delta >= this.backSwing);
        };
        Weapon.prototype.isCharging = function () {
            this.chargeTime = this.game.time.now - this.chargeStartTime;
            if (this.chargeTime >= this.minimumChargeTime) {
                return this.charging;
            }
            else {
                return false;
            }
            //return this.charging;
        };
        Object.defineProperty(Weapon.prototype, "currentPower", {
            get: function () {
                this.chargeTime = (this.game.time.now - this.chargeStartTime) - this.minimumChargeTime;
                var halfChargeTime = this.fullChargeTime / 2;
                if (this.chargeTime > this.fullChargeTime) {
                    this.chargeTime = this.fullChargeTime;
                }
                if (this.chargeTime < this.minimumChargeTime) {
                    this.chargeTime = 0;
                }
                return this.chargeTime / halfChargeTime;
            },
            enumerable: true,
            configurable: true
        });
        Weapon.prototype.startCharging = function () {
            this.charging = true;
            this.chargeTime = 0;
            this.chargeStartTime = this.game.time.now;
        };
        Weapon.prototype.stopCharging = function () {
            var power = this.currentPower;
            this.cancelCharging();
            return power;
        };
        Weapon.prototype.cancelCharging = function () {
            this.charging = false;
            this.chargeTime = 0;
            if (this.chargeSprite != null) {
                this.chargeSprite.animations.stop();
                this.chargeSprite.visible = false;
            }
        };
        Weapon.prototype.update = function (owner) {
            if (this.chargeSprite != null) {
                var currentAnim = this.chargeSprite.animations.currentAnim;
                if (this.isCharging() && (currentAnim == null || !currentAnim.isPlaying || !this.chargeSprite.visible)) {
                    this.chargeSprite.visible = true;
                    this.chargeSprite.animations.play('mini_charge_down');
                    this.game.add.existing(this.chargeSprite);
                }
                if (this.chargeSprite.visible) {
                    var anglePoint = KGAD.MovementHelper.getPointFromDirection(owner.direction).multiply(15, 15);
                    var position = Phaser.Point.add(anglePoint, owner.position);
                    this.chargeSprite.position = position;
                    if (this.currentPower >= 2) {
                        this.chargeSprite.animations.play('charge_down');
                    }
                }
            }
        };
        return Weapon;
    })();
    KGAD.Weapon = Weapon;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />
var KGAD;
(function (KGAD) {
    var Enemy = (function (_super) {
        __extends(Enemy, _super);
        function Enemy(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            this.debugStateName = "idle";
            this.unblockTries = 0;
            this.attached = [];
            this.movementSpeed = 75;
            this.tilePosition = null;
            this.lastTilePosition = null;
            this.rerouting = false;
            this.health = 3;
        }
        Enemy.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.body.immovable = true;
            this.weapon = new KGAD.Weapon(this.game, 'short_sword', 1500, 0, 1, 0, null);
            this.weapon.backSwing = 500;
            this.weapon.range = 32;
            if (args.length > 0) {
                this.enemyType = args[0];
                this.health = this.enemyType.health;
            }
        };
        Enemy.prototype.addToWorld = function () {
            var _this = this;
            this.threatTable = new KGAD.ThreatTable(this);
            this.threatTable.highestThreatChanged.add(function (who) {
                _this.onHighestThreatTargetChanged(who);
            });
            this.blocked.add(function (blockedBy) {
                _this.onBlocked(blockedBy);
            });
            _super.prototype.addToWorld.call(this);
        };
        Object.defineProperty(Enemy.prototype, "alliance", {
            get: function () {
                return KGAD.Alliance.Enemy;
            },
            enumerable: true,
            configurable: true
        });
        Enemy.prototype.onBlocked = function (blockedBy) {
            var _this = this;
            this.stopMovementTween();
            if (this.rerouting) {
                return;
            }
            for (var i = 0, l = blockedBy.length; i < l; ++i) {
                var occupant = blockedBy[i];
                if (occupant.alliance !== this.alliance) {
                    this.threatTable.addThreat(occupant, 10);
                }
            }
            this.debugStateName = 'rerouting';
            this.game.time.events.add(100, function () {
                _this.unsetCurrentPath();
                _this.rerouting = false;
            }, this);
            this.rerouting = true;
        };
        Object.defineProperty(Enemy.prototype, "weight", {
            get: function () {
                if (this.rerouting) {
                    return 0;
                }
                if (this.action == KGAD.Actions.Firing || this.weapon.isBackSwinging()) {
                    return 0;
                }
                else if (this.action == KGAD.Actions.Moving) {
                    return 2;
                }
                else if (this.action == KGAD.Actions.Dying || this.action == KGAD.Actions.Dead) {
                    return 1;
                }
                return 5;
            },
            enumerable: true,
            configurable: true
        });
        Enemy.prototype.inflictDamage = function (amount, source) {
            var _this = this;
            var willDie = false;
            if (this.health - amount <= 0) {
                willDie = true;
            }
            if (!willDie) {
                this.threatTable.addThreat(source, amount);
                _super.prototype.damage.call(this, amount);
            }
            else {
                this.health = 0;
                delete this.body;
            }
            if (this.health <= 0) {
                if (!KGAD.OccupiedGrid.remove(this)) {
                    console.error("Enemy was not removed!");
                }
                if (this.movementTween != null && this.movementTween.isRunning) {
                    this.movementTween.stop(false);
                }
                this.currentPath = null;
                this.currentDestination = null;
                var onAnimationComplete = function () {
                    _this.action = KGAD.Actions.Dead;
                    _this.updateAnimation();
                    _this.game.add.tween(_this).to({ alpha: 0 }, 500).start().onComplete.addOnce(function () {
                        _this.kill();
                    });
                };
                this.action = KGAD.Actions.Dying;
                this.direction = 2 /* Down */;
                this.updateAnimation(onAnimationComplete);
            }
            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }
            this.damageTween = this.game.add.tween(this).to({ tint: 0xFF3333 }, 35, Phaser.Easing.Cubic.InOut, true, 0, 2, true);
            return this;
        };
        Enemy.prototype.attach = function (projectile) {
            this.attached.push(projectile);
            //projectile.attachTo(this);
        };
        Enemy.prototype.preUpdate = function () {
            _super.prototype.preUpdate.call(this);
        };
        Enemy.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this.health <= 0) {
                return;
            }
            this.threatTable.update();
            this.pathFindingMover.update();
            if (this.currentTarget == null) {
                this.currentTarget = this.threatTable.getHighestThreatTarget();
                if (this.currentTarget == null) {
                    this.debugStateName = 'no_target';
                    return;
                }
            }
            if (this.weapon.isBackSwinging() || this.isCentering() || this.rerouting || this.isMoveTweening()) {
                return;
            }
            if (!this.inRangeOf(this.currentTarget)) {
                this.seekTarget();
            }
            else {
                this.attackTarget();
            }
        };
        Enemy.prototype.render = function () {
            return;
            if (this.health <= 0) {
                return;
            }
            this.game.debug.text(this.debugStateName, this.x - 16, this.y - 16, '#FFFFFF', '12px Courier new');
            if (this.currentDestination != null) {
            }
            //this.pathFindingMover.render();
            //this.game.debug.geom(new Phaser.Rectangle(this.tilePosition.x * 32, this.tilePosition.y * 32, 32, 32));
            if (this.currentTarget != null) {
            }
        };
        /**
         *  Centers on the currently occupied tile.
         */
        Enemy.prototype.centerOnTile = function () {
            var map = KGAD.Game.CurrentMap;
            var pos = this.tilePosition;
            var center = map.toPixels(pos).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            this.stopMovementTween();
            if (this.centerTween != null && this.centerTween.isRunning) {
                this.centerTween.stop(false);
            }
            var timeToMove = Phaser.Point.distance(this.position, center) / this.movementSpeed * 1000;
            if (timeToMove === 0) {
                return;
            }
            this.centerTween = this.game.add.tween(this).to({ x: center.x, y: center.y }, timeToMove, Phaser.Easing.Linear.None, true, 0);
        };
        /**
         *  Gets or sets whether or not this enemy is centering on a tile.
         */
        Enemy.prototype.isCentering = function () {
            return this.centerTween != null && this.centerTween.isRunning;
        };
        /**
         *  Un-sets the current path, allowing a new one to be created.
         */
        Enemy.prototype.unsetCurrentPath = function () {
            this.currentPath = null;
            this.currentDestination = null;
            this.pathFindingMover.currentPath = null;
            return null;
        };
        /**
         *  Move towards a target.
         */
        Enemy.prototype.seekTarget = function () {
            this.action = KGAD.Actions.Moving;
            var map = KGAD.Game.CurrentMap;
            var targetPosition = this.currentTarget.position;
            var targetPositionTiles = map.fromPixels(targetPosition);
            var targetBounds = KGAD.OccupiedGrid.getBoundsOfSprite(this.currentTarget);
            var path = this.pathFindingMover.currentPath;
            if (path != null && path.length > 0) {
                var lastNode = this.pathFindingMover.currentPath.peekLast();
                var targetNode = new Phaser.Rectangle(targetBounds.x, targetBounds.y, targetBounds.width, targetBounds.height);
                if (!Phaser.Rectangle.intersects(lastNode, targetNode)) {
                    path = this.unsetCurrentPath();
                }
            }
            if (path == null || path.length === 0) {
                // Find a path to the target.
                this.currentPath = map.findPath(this.tilePosition, targetPositionTiles);
                this.pathFindingMover.setCurrentPath(new KGAD.Path(this.currentPath));
            }
            if (this.currentPath != null && this.currentPath.length > 0) {
                this.moveToNextDestination();
            }
        };
        /**
         *  Attacks the target.
         */
        Enemy.prototype.attackTarget = function () {
            this.action = KGAD.Actions.Firing;
            this.body.velocity.setTo(0);
            this.face(this.currentTarget);
            this.updateAnimation();
            this.rerouting = false;
            if (this.weapon.canFire) {
                this.debugStateName = 'attacking';
                this.currentTarget.inflictDamage(this.weapon.power, this);
                if (!this.currentTarget.alive) {
                    this.threatTable.removeThreatTarget(this.currentTarget);
                    this.currentTarget = null;
                }
                this.weapon.lastFireTime = this.game.time.now;
            }
        };
        /**
         *  Called when the highest threat target has changed.
         */
        Enemy.prototype.onHighestThreatTargetChanged = function (sprite) {
            this.currentTarget = sprite;
            this.unsetCurrentPath();
        };
        /**
         *  Checks if this enemy is in range of a sprite.
         */
        Enemy.prototype.inRangeOf = function (sprite) {
            var distance = Phaser.Point.distance(this.position, sprite.position);
            if (distance <= KGAD.GameMap.TILE_WIDTH) {
                return true;
            }
            return false;
        };
        /**
         *  Checks if an obstacle is between this enemy and the target.
         */
        Enemy.prototype.getObstacleBetween = function (sprite) {
            var line = new Phaser.Line(this.x, this.y, sprite.x, sprite.y);
            var sprites = KGAD.CollisionHelper.raycastForSprites(line, 4, this);
            for (var i = 0, l = sprites.length; i < l; ++i) {
                var obstacle = sprites[i];
                if (obstacle === sprite || obstacle === this) {
                    continue;
                }
                return obstacle;
            }
            return null;
        };
        /**
         *  Moves to the next destination in the pathfinding node.
         */
        Enemy.prototype.moveToNextDestination = function () {
            if (this.isMoveTweening()) {
                return;
            }
            var path = this.pathFindingMover.currentPath;
            if (path == null) {
                return;
            }
            var rect = path.next();
            if (rect == null) {
                this.pathFindingMover.currentPath = null;
                this.currentPath = null;
                return;
            }
            this.unblockTries = 0;
            this.debugStateName = 'moving';
            var center = new Phaser.Point(rect.centerX, rect.centerY);
            var angle = this.game.physics.arcade.angleBetween(this.position, center);
            this.direction = KGAD.MovementHelper.getDirectionFromAngle(angle);
            this.action = KGAD.Actions.Moving;
            this.updateAnimation();
            this.moveTweenTo(center);
            this.currentDestination = center;
        };
        return Enemy;
    })(KGAD.AnimatedSprite);
    KGAD.Enemy = Enemy;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var FiredProjectile = (function (_super) {
        __extends(FiredProjectile, _super);
        function FiredProjectile(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            this.dead = false;
            this.canOccupy = false;
        }
        FiredProjectile.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.body.collideWorldBounds = false;
            this.body.immovable = false;
            this.body.angle = this.angle;
            this.weapon = args[0];
            this.firedBy = args[1];
            this.chargePower = args[2];
            if (!this.chargePower) {
                this.chargePower = 0;
            }
            this.weapon.lastFireTime = this.game.time.now;
            this.direction = KGAD.MovementHelper.getDirectionFromAngle(this.rotation);
            if (this.direction == 0 /* Up */ || this.direction == 2 /* Down */) {
                var h = this.body.width;
                this.body.width = this.body.height;
                this.body.height = h;
            }
        };
        Object.defineProperty(FiredProjectile.prototype, "power", {
            get: function () {
                return Math.floor(this.weapon.power + (this.weapon.power * this.chargePower));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FiredProjectile.prototype, "speed", {
            get: function () {
                return Math.floor(this.weapon.projectileSpeed + this.weapon.projectileSpeed * (this.chargePower / 4));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FiredProjectile.prototype, "canOccupyTiles", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        FiredProjectile.prototype.attachTo = function (who) {
            var _this = this;
            this.attachedTo = who;
            this.dead = true;
            this.game.time.events.add(3000, function () {
                _this.game.add.tween(_this).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.addOnce(function () {
                    _this.kill();
                });
            }, this);
            this.offsetPosition = Phaser.Point.subtract(this.attachedTo.position, this.position).divide(2, 2);
            this.originalDirection = who.direction;
        };
        FiredProjectile.prototype.update = function () {
            if (this.attachedTo != null) {
                this.position = Phaser.Point.subtract(this.attachedTo.position, this.offsetPosition);
                if (this.attachedTo.direction != this.originalDirection) {
                }
                if (this.attachedTo.alpha < 1) {
                    this.alpha = Math.min(this.alpha, this.attachedTo.alpha);
                }
            }
        };
        return FiredProjectile;
    })(KGAD.AnimatedSprite);
    KGAD.FiredProjectile = FiredProjectile;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />
var KGAD;
(function (KGAD) {
    var Hero = (function (_super) {
        __extends(Hero, _super);
        function Hero(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            this.keys = {};
            this.movementKeyState = {
                up: false,
                left: false,
                right: false,
                down: false
            };
            this.canMove = true;
            var keyboard = game.input.keyboard;
            this.keys[0 /* Up */] = [keyboard.addKey(Phaser.Keyboard.UP), keyboard.addKey(Phaser.Keyboard.W)];
            this.keys[1 /* Left */] = [keyboard.addKey(Phaser.Keyboard.LEFT), keyboard.addKey(Phaser.Keyboard.A)];
            this.keys[2 /* Down */] = [keyboard.addKey(Phaser.Keyboard.DOWN), keyboard.addKey(Phaser.Keyboard.S)];
            this.keys[3 /* Right */] = [keyboard.addKey(Phaser.Keyboard.RIGHT), keyboard.addKey(Phaser.Keyboard.D)];
            this.fireKey = [keyboard.addKey(Phaser.Keyboard.Z), keyboard.addKey(Phaser.Keyboard.SPACEBAR)];
            this.weapon = new KGAD.Weapon(game, 'basic_arrow', 400, 750);
            this.weapon.preload();
            this.movementSpeed = 150;
            this.health = 5;
            this.moving = false;
            this.chargeDirection = null;
        }
        Object.defineProperty(Hero.prototype, "weight", {
            get: function () {
                if (this.moving) {
                    return 1;
                }
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        Hero.prototype.init = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.weapon.chargeSprite = new KGAD.BowCharge(this.game, 0, 0, 'charge');
            this.weapon.chargeSprite.init();
            this.body.immovable = true;
            this.lastTile = KGAD.Game.CurrentMap.fromPixels(this.position);
            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    var keys = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];
                        var dir = parseInt(direction, 10);
                        switch (dir) {
                            case 0 /* Up */:
                                key.onDown.add(function () {
                                    _this.setMovementState(0 /* Up */, true);
                                });
                                key.onUp.add(function () {
                                    _this.setMovementState(0 /* Up */, false);
                                });
                                break;
                            case 1 /* Left */:
                                key.onDown.add(function () {
                                    _this.setMovementState(1 /* Left */, true);
                                });
                                key.onUp.add(function () {
                                    _this.setMovementState(1 /* Left */, false);
                                });
                                break;
                            case 2 /* Down */:
                                key.onDown.add(function () {
                                    _this.setMovementState(2 /* Down */, true);
                                });
                                key.onUp.add(function () {
                                    _this.setMovementState(2 /* Down */, false);
                                });
                                break;
                            case 3 /* Right */:
                                key.onDown.add(function () {
                                    _this.setMovementState(3 /* Right */, true);
                                });
                                key.onUp.add(function () {
                                    _this.setMovementState(3 /* Right */, false);
                                });
                                break;
                        }
                    }
                }
            }
            this.fireKey.forEach(function (value) {
                value.onDown.add(function () {
                    _this.fireKeyDown();
                });
                value.onUp.add(function () {
                    _this.fireKeyUp();
                });
            });
        };
        /**
         *  Checks if a directional key is pressed immediately.
         */
        Hero.prototype.isDown = function (dir) {
            var result = false;
            var keys = this.keys[dir];
            for (var i = 0, l = keys.length; i < l; ++i) {
                var key = keys[i];
                if (key.isDown) {
                    result = true;
                    break;
                }
            }
            return result;
        };
        Hero.prototype.fireKeyDown = function () {
            if (!this.alive) {
                return;
            }
            this.weapon.startCharging();
            if (this.isDown(0 /* Up */)) {
                this.chargeDirection = 0 /* Up */;
            }
            else if (this.isDown(2 /* Down */)) {
                this.chargeDirection = 2 /* Down */;
            }
            else if (this.isDown(1 /* Left */)) {
                this.chargeDirection = 1 /* Left */;
            }
            else if (this.isDown(3 /* Right */)) {
                this.chargeDirection = 3 /* Right */;
            }
            else {
                this.chargeDirection = this.direction;
            }
            this.updateMovementState();
            /*
            var currentDirection = MovementHelper.getNameOfDirection(this.direction);
            if (this.movementKeyState[currentDirection]) {
                this.chargeDirection = this.direction;
            }
            else {
                
            }*/
        };
        Hero.prototype.fireKeyUp = function () {
            if (!this.alive) {
                return;
            }
            var chargePower = this.weapon.stopCharging();
            this.fire(chargePower);
        };
        Hero.prototype.fire = function (chargePower) {
            if (!this.alive) {
                return;
            }
            var projectiles = KGAD.Game.Projectiles;
            if (this.weapon.canFire) {
                projectiles.fire(this.x, this.y, this, this.weapon, chargePower);
                /*if (this.movementTween != null && this.movementTween.isRunning) {
                    // The player released a shot mid-tween.
                    // Stop the current tween and start a new one so that they can finish tweening at a faster speed.
                    var nextTilePosition = (<Phaser.Point>Game.CurrentMap.toPixels(this.nextTile)).add(GameMap.TILE_WIDTH / 2, GameMap.TILE_HEIGHT / 2);
                    var remainingDistance = Phaser.Point.distance(this.position, nextTilePosition);
                    if (remainingDistance > 0.0001) {
                        this.movementTween.stop(false);
                        var timeToMove = Math.min(this.movementSpeed * (remainingDistance / GameMap.TILE_WIDTH), this.movementSpeed);
                        this.moveToNextTile(timeToMove);
                    }
                    else {
                        this.movementTween.stop(true);
                    }
                }*/
                this.updateMovementState();
                this.chargeDirection = null;
            }
        };
        /**
         *  Handle moving in the given direction.
         */
        Hero.prototype.handleMovement = function (direction) {
            if (!this.canMove) {
                return;
            }
            if (!this.alive) {
                return;
            }
            var nextTile = Phaser.Point.add(this.tilePosition, KGAD.MovementHelper.getPointFromDirection(direction));
            if (this.weapon.isCharging() && this.chargeDirection != null) {
                this.direction = this.chargeDirection;
            }
            else {
                this.direction = direction;
            }
            var map = KGAD.Game.CurrentMap;
            /*if (!map.occupy(nextTile.x, nextTile.y, this)) {
                this.moving = false;
                this.canMove = true;
                this.action = Actions.Standing;
                this.body.velocity.setTo(0);
                this.updateAnimation();
                return;
            }

            this.tilePosition = nextTile;
            this.canMove = false;
            this.moving = true;
            this.action = Actions.Moving;
            this.nextTile = nextTile;*/
            var speed = this.weapon.isCharging() ? this.movementSpeed / 3 : this.movementSpeed;
            this.action = KGAD.Actions.Moving;
            this.updateAnimation();
            KGAD.MovementHelper.move(this, direction, speed);
            this.moving = true;
            //var timeToMove = this.weapon.isCharging() ? this.movementSpeed * 2 : this.movementSpeed;
            //this.moveToNextTile(timeToMove);
        };
        /**
         *  Move to the next tile.
         */
        Hero.prototype.moveToNextTile = function (speed) {
            var _this = this;
            var nextPosition = KGAD.Game.CurrentMap.toPixels(this.nextTile);
            this.movementTween = this.game.add.tween(this);
            this.movementTween.to({ x: nextPosition.x + KGAD.GameMap.TILE_WIDTH / 2, y: nextPosition.y + KGAD.GameMap.TILE_HEIGHT / 2 }, speed, Phaser.Easing.Linear.None, false, 0);
            this.movementTween.onComplete.addOnce(function () {
                _this.canMove = true;
                _this.lastTile = _this.nextTile;
                _this.updateMovementState();
            });
            this.movementTween.start();
            this.updateAnimation();
        };
        /**
         *  Sets the state of the hero's movement.
         */
        Hero.prototype.setMovementState = function (direction, isMoving) {
            var directionName = KGAD.MovementHelper.getNameOfDirection(direction);
            this.movementKeyState[directionName] = isMoving;
            if (isMoving) {
                this.handleMovement(direction);
            }
            else {
                this.updateMovementState();
            }
        };
        /**
         *  Update's the player's movement state based on what keys are pressed.
         */
        Hero.prototype.updateMovementState = function () {
            var states = this.movementKeyState;
            var direction = null;
            if (states.up) {
                direction = 0 /* Up */;
            }
            else if (states.down) {
                direction = 2 /* Down */;
            }
            else if (states.left) {
                direction = 1 /* Left */;
            }
            else if (states.right) {
                direction = 3 /* Right */;
            }
            var currentDirection = this.direction;
            var curDirName = KGAD.MovementHelper.getNameOfDirection(currentDirection);
            if (states[curDirName] === true) {
                direction = this.direction;
            }
            if (direction != null) {
                this.handleMovement(direction);
            }
            else {
                this.moving = false;
                this.canMove = true;
                this.action = KGAD.Actions.Standing;
                this.body.velocity.setTo(0);
                if (this.chargeDirection != null) {
                    this.direction = this.chargeDirection;
                }
                this.updateAnimation();
            }
        };
        Hero.prototype.inflictDamage = function (amount, source) {
            _super.prototype.inflictDamage.call(this, amount, source);
            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
            }
            this.damageTween = KGAD.AnimationHelper.createDamageTween(this);
            this.damageTween.start();
            return this;
        };
        Hero.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this.moving) {
                if (this.lastChargingState !== this.weapon.isCharging()) {
                    //this.chargeDirection = this.direction;
                    this.lastChargingState = this.weapon.isCharging();
                    this.updateMovementState();
                }
            }
            this.weapon.update(this);
        };
        Hero.prototype.render = function () {
            _super.prototype.render.call(this);
        };
        Hero.KEY = "hero";
        return Hero;
    })(KGAD.AnimatedSprite);
    KGAD.Hero = Hero;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />
var KGAD;
(function (KGAD) {
    var King = (function (_super) {
        __extends(King, _super);
        function King(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            this.health = 35;
        }
        Object.defineProperty(King.prototype, "weight", {
            get: function () {
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        King.prototype.inflictDamage = function (amount, source) {
            _super.prototype.inflictDamage.call(this, amount, source);
            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
            }
            this.damageTween = KGAD.AnimationHelper.createDamageTween(this);
            this.damageTween.start();
            return this;
        };
        return King;
    })(KGAD.AnimatedSprite);
    KGAD.King = King;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />
var KGAD;
(function (KGAD) {
    var Mercenary = (function (_super) {
        __extends(Mercenary, _super);
        function Mercenary(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            this.movementSpeed = 50;
            this.health = 3;
            this.engageRange = 64;
        }
        Mercenary.prototype.init = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this.weapon = new KGAD.Weapon(this.game, 'short_sword', 1500, 0, 1, 0, null);
            this.weapon.backSwing = 500;
            this.weapon.range = 32;
            this.threatTable = new KGAD.ThreatTable(this);
            this.threatTable.highestThreatChanged.add(function (sprite) {
                _this.onHighestThreatTargetChanged(sprite);
            });
            KGAD.AnimationLoader.addAnimationToSprite(this, this.key);
        };
        Mercenary.prototype.addToWorld = function () {
            _super.prototype.addToWorld.call(this);
            this.startingPoint = new Phaser.Point(this.x, this.y);
        };
        Mercenary.prototype.checkThreatAgainst = function (enemy) {
            var distance = Phaser.Point.distance(this.startingPoint, enemy);
            if (distance <= this.engageRange) {
                var threat = (Math.max(1, (this.engageRange - distance)) / this.engageRange) * 0.075;
                this.threatTable.addThreat(enemy, threat);
            }
            else {
                this.threatTable.addThreat(enemy, -0.1);
            }
        };
        Object.defineProperty(Mercenary.prototype, "alliance", {
            get: function () {
                return KGAD.Alliance.Ally;
            },
            enumerable: true,
            configurable: true
        });
        Mercenary.prototype.inflictDamage = function (amount, source) {
            var _this = this;
            var willDie = false;
            if (this.health - amount <= 0) {
                willDie = true;
            }
            if (!willDie) {
                this.threatTable.addThreat(source, amount * 2);
                _super.prototype.damage.call(this, amount);
            }
            else {
                this.health = 0;
                delete this.body;
            }
            if (this.health <= 0) {
                if (!KGAD.OccupiedGrid.remove(this)) {
                    console.error("Mercenary was not removed!");
                }
                if (this.movementTween != null && this.movementTween.isRunning) {
                    this.movementTween.stop(false);
                }
                var onAnimationComplete = function () {
                    _this.action = KGAD.Actions.Dead;
                    _this.updateAnimation();
                    _this.game.add.tween(_this).to({ alpha: 0 }, 500).start().onComplete.addOnce(function () {
                        _this.kill();
                    });
                };
                this.action = KGAD.Actions.Dying;
                this.direction = 2 /* Down */;
                this.updateAnimation(onAnimationComplete);
            }
            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }
            this.damageTween = this.game.add.tween(this).to({ tint: 0xFF3333 }, 35, Phaser.Easing.Cubic.InOut, true, 0, 2, true);
            return this;
        };
        Mercenary.prototype.update = function () {
            var dead = !this.alive || !this.exists || this.health <= 0;
            if (dead || this.weapon.isBackSwinging()) {
                return;
            }
            this.threatTable.update();
            if (this.currentTarget != null) {
                this.action = KGAD.Actions.Firing;
                this.face(this.currentTarget);
                this.updateAnimation();
                this.attackTarget();
                if (this.currentTarget.health <= 0) {
                    this.currentTarget = null;
                }
            }
            if (this.currentTarget == null) {
                this.action = KGAD.Actions.Standing;
                this.updateAnimation();
                this.currentTarget = this.threatTable.getHighestThreatTarget();
            }
        };
        Mercenary.prototype.onHighestThreatTargetChanged = function (sprite) {
            this.currentTarget = sprite;
        };
        Mercenary.prototype.attackTarget = function () {
            if (!this.weapon.canFire) {
                return;
            }
            var distance = Phaser.Point.distance(this, this.currentTarget);
            if (distance <= this.weapon.range) {
                this.weapon.lastFireTime = this.game.time.now;
                this.currentTarget.inflictDamage(this.weapon.power, this);
            }
        };
        return Mercenary;
    })(KGAD.AnimatedSprite);
    KGAD.Mercenary = Mercenary;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var ProjectileManager = (function () {
        function ProjectileManager() {
            this.activeProjectiles = [];
            this.inactiveProjectiles = [];
            this.groups = {};
        }
        ProjectileManager.prototype.preload = function () {
        };
        /**
         *  Gets all active projectiles on the field.
         */
        ProjectileManager.prototype.getActiveProjectiles = function () {
            return this.activeProjectiles;
        };
        /**
         *  Gets all groups associated with this generator.
         */
        ProjectileManager.prototype.getGroups = function () {
            var groups = [];
            for (var key in this.groups) {
                if (this.groups.hasOwnProperty(key)) {
                    var group = this.groups[key];
                    groups.push(group);
                }
            }
            return groups;
        };
        /**
         *  Gets a group by the projectile type.
         */
        ProjectileManager.prototype.getGroupByType = function (key) {
            if (!this.groups[key]) {
                this.createGroup(key);
            }
            return this.groups[key];
        };
        /**
         *  Creates a new group used to generate projectiles.
         */
        ProjectileManager.prototype.createGroup = function (key) {
            var game = KGAD.Game.Instance;
            var group = game.add.group();
            group.classType = KGAD.FiredProjectile;
            this.groups[key] = group;
        };
        /**
         *  Turn an active projectile into an inactive one.
         */
        ProjectileManager.prototype.makeInactive = function (proj) {
            var index = this.activeProjectiles.indexOf(proj);
            if (index >= 0) {
                this.activeProjectiles.splice(index, 1);
                this.inactiveProjectiles.push(proj);
                return true;
            }
            return false;
        };
        /**
         *  Kills a projectile and remove it from the list of projectiles.
         */
        ProjectileManager.prototype.killProjectile = function (proj) {
            var game = KGAD.Game.Instance;
            var index = this.activeProjectiles.indexOf(proj);
            var deleted = null;
            if (index >= 0) {
                deleted = this.activeProjectiles.splice(index, 1);
            }
            index = this.inactiveProjectiles.indexOf(proj);
            if (index >= 0) {
                deleted = this.inactiveProjectiles.splice(index, 1);
            }
            if (!proj.dead || index >= 0) {
                game.add.tween(proj).to({ alpha: 0 }, 250).start().onComplete.addOnce(function () {
                    proj.kill();
                });
            }
            return deleted == null || deleted.length === 0 ? null : deleted[0];
        };
        /**
         *  Fire a projectile.
         */
        ProjectileManager.prototype.fire = function (x, y, who, weapon, chargePower, onKill) {
            var _this = this;
            var game = KGAD.Game.Instance;
            var direction = who.direction;
            var p = KGAD.MovementHelper.getPointFromDirection(direction);
            var projectileStartPosition = Phaser.Point.add(who.position, p);
            var group = this.getGroupByType(weapon.key);
            var sprite = group.create(x, y, weapon.key);
            sprite.rotation = Phaser.Point.angle(KGAD.MovementHelper.getPointFromDirection(direction), new Phaser.Point());
            sprite.init(weapon, who, chargePower);
            sprite.body.rotation = sprite.rotation;
            sprite.body.width = sprite.body.width - 1;
            sprite.body.height = sprite.body.height - 1;
            game.physics.arcade.velocityFromAngle(sprite.angle, sprite.speed, sprite.body.velocity);
            setTimeout(function () {
                _this.killProjectile(sprite);
            }, weapon.aliveTime);
            this.activeProjectiles.push(sprite);
        };
        ProjectileManager.prototype.update = function () {
            var _this = this;
            var game = KGAD.Game.Instance;
            game.physics.arcade.collide(this.activeProjectiles, KGAD.Game.CurrentMap.collisionLayer, function (proj) {
                _this.onProjectileHitWall(proj);
            });
            game.physics.arcade.overlap(this.activeProjectiles, KGAD.Game.CurrentMap.collisionLayer, function (proj) {
                _this.onProjectileHitWall(proj);
            });
            for (var i = 0, l = this.activeProjectiles.length; i < l; ++i) {
                this.activeProjectiles[i].update();
            }
            for (i = 0, l = this.inactiveProjectiles.length; i < l; ++i) {
                this.inactiveProjectiles[i].update();
            }
        };
        ProjectileManager.prototype.onProjectileHitWall = function (proj) {
            this.makeInactive(proj);
        };
        return ProjectileManager;
    })();
    KGAD.ProjectileManager = ProjectileManager;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var ScriptEngine = (function () {
        function ScriptEngine() {
        }
        return ScriptEngine;
    })();
    KGAD.ScriptEngine = ScriptEngine;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var ThreatTable = (function () {
        function ThreatTable(parent) {
            this._parent = parent;
            this._table = [];
            this.highestThreatChanged = new Phaser.Signal();
            var king = KGAD.Game.King;
            var hero = KGAD.Game.Hero;
            if (parent.alliance !== king.alliance) {
                this.addThreat(king, 0.5);
                this.addThreat(hero, 0.5);
            }
            this.doTableMaintenance();
        }
        Object.defineProperty(ThreatTable.prototype, "parent", {
            /**
             *  Gets the owner of the threat table.
             */
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *
         */
        ThreatTable.prototype.addThreat = function (sprite, threat) {
            if (sprite === this._parent) {
                // A sprite cannot be a threat to himself.
                return 0;
            }
            var newThreat = 0;
            var idx = this.indexOfSpriteInTable(sprite);
            if (idx < 0) {
                idx = this.createThreatTarget(sprite, threat);
                newThreat = this._table[idx].threat;
            }
            else {
                var threatData = this._table[idx];
                threatData.threat = Math.max(0, threatData.threat + threat);
                newThreat = threatData.threat;
            }
            this.doTableMaintenance();
            return newThreat;
        };
        /**
         *  Remove a target from the threat table.
         */
        ThreatTable.prototype.removeThreatTarget = function (sprite) {
            var removed = false;
            var idx = this.indexOfSpriteInTable(sprite);
            if (idx >= 0) {
                this._table.splice(idx, 1);
                removed = true;
            }
            this.doTableMaintenance();
            return removed;
        };
        /**
         *  Gets the highest threat target in the threat table.
         */
        ThreatTable.prototype.getHighestThreatTarget = function () {
            return this._highestThreatTarget;
        };
        /**
         *  Gets the threat level for the given sprite.
         */
        ThreatTable.prototype.getThreatFor = function (sprite) {
            var idx = this.indexOfSpriteInTable(sprite);
            if (idx < 0) {
                return 0;
            }
            return this._table[idx].threat;
        };
        /**
         *  Does maintenance on the current state of the threat table.
         */
        ThreatTable.prototype.update = function () {
            if (this._highestThreatTarget != null && !this._highestThreatTarget.alive) {
                this.doTableMaintenance();
            }
        };
        /**
         *  Perform maintenance on the table, such as removing targets who no longer exist.
         */
        ThreatTable.prototype.doTableMaintenance = function () {
            var removables = [];
            var highestThreatSprite = null;
            var highestThreat = -99999;
            for (var i = 0, l = this._table.length; i < l; ++i) {
                var entry = this._table[i];
                var sprite = entry.sprite;
                if (!sprite.alive || !sprite.exists) {
                    removables.push(sprite);
                }
                else {
                    if (entry.threat > highestThreat) {
                        highestThreatSprite = sprite;
                        highestThreat = entry.threat;
                    }
                }
            }
            if (this._highestThreatTarget != highestThreatSprite) {
                this.highestThreatChanged.dispatch(highestThreatSprite);
            }
            this._highestThreatTarget = highestThreatSprite;
            for (i = 0, l = removables.length; i < l; ++i) {
                this.removeThreatTarget(removables[i]);
            }
        };
        /**
         *  Find the index of the sprite in the table.
         */
        ThreatTable.prototype.indexOfSpriteInTable = function (sprite) {
            var index = -1;
            for (var i = 0, l = this._table.length; i < l; ++i) {
                var entry = this._table[i];
                if (entry.sprite === sprite) {
                    index = i;
                    break;
                }
            }
            return index;
        };
        /**
         *  Adds a threat target to the table and returns the new index.
         */
        ThreatTable.prototype.createThreatTarget = function (sprite, initialThreat) {
            if (initialThreat === void 0) { initialThreat = 0; }
            return this._table.push({
                sprite: sprite,
                threat: initialThreat
            }) - 1;
        };
        return ThreatTable;
    })();
    KGAD.ThreatTable = ThreatTable;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    (function (Directions) {
        Directions[Directions["Up"] = 0] = "Up";
        Directions[Directions["Left"] = 1] = "Left";
        Directions[Directions["Down"] = 2] = "Down";
        Directions[Directions["Right"] = 3] = "Right";
    })(KGAD.Directions || (KGAD.Directions = {}));
    var Directions = KGAD.Directions;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var MovementHelper = (function () {
        function MovementHelper() {
        }
        /**
         *  Moves a sprite in the given direction.
         */
        MovementHelper.move = function (sprite, direction, speed) {
            if (speed === void 0) { speed = 200; }
            var map = KGAD.Game.CurrentMap;
            var game = sprite.game;
            var dir = parseInt(direction, 10);
            var originPixels = sprite.position;
            var origin = map.fromPixels(originPixels);
            var dest = null;
            switch (dir) {
                case 0 /* Up */:
                    dest = new Phaser.Point(origin.x, origin.y - 1);
                    break;
                case 1 /* Left */:
                    dest = new Phaser.Point(origin.x - 1, origin.y);
                    break;
                case 2 /* Down */:
                    dest = new Phaser.Point(origin.x, origin.y + 1);
                    break;
                case 3 /* Right */:
                    dest = new Phaser.Point(origin.x + 1, origin.y);
                    break;
                default:
                    throw new Error("Invalid direction: " + direction);
            }
            dest = map.toPixels(dest);
            var startTime = game.time.now;
            var maxTime = (Phaser.Point.distance(originPixels, dest) / speed) * 1000;
            var angle = MovementHelper.getAngleFromDirection(direction);
            game.physics.arcade.velocityFromRotation(angle, speed, sprite.body.velocity);
            //game.physics.arcade.moveToXY(sprite, dest.x, dest.y, speed);
            return true;
        };
        /**
         *  Gets a point that is one pixel away in the given direction.
         */
        MovementHelper.getPointFromDirection = function (dir) {
            var direction = parseInt(dir, 10);
            switch (direction) {
                case 0 /* Up */:
                    return new Phaser.Point(0, -1);
                case 1 /* Left */:
                    return new Phaser.Point(-1, 0);
                case 2 /* Down */:
                    return new Phaser.Point(0, 1);
                case 3 /* Right */:
                    return new Phaser.Point(1, 0);
            }
            return new Phaser.Point();
        };
        MovementHelper.getRotationFromDirections = function (dir1, dir2) {
            var angle1 = MovementHelper.getAngleFromDirection(dir1);
            var angle2 = MovementHelper.getAngleFromDirection(dir2);
            var a = angle2 - angle1;
            a = ((a + Math.PI) % Math.PI * 2) - Math.PI;
            return a;
        };
        /**
         *  Clamps an angle to a number between 0 and 2PI in radians.
         */
        MovementHelper.clampAngle = function (angle) {
            var twopi = Math.PI * 2;
            while (angle < 0) {
                angle += twopi;
            }
            while (angle > twopi) {
                angle -= twopi;
            }
            return angle;
        };
        MovementHelper.convertAngle = function (angle) {
            return MovementHelper.clampAngle(angle + Math.PI);
        };
        /**
         *  Gets an angle in radians from a direction.
         */
        MovementHelper.getAngleFromDirection = function (dir) {
            switch (parseInt(dir, 10)) {
                case 0 /* Up */:
                    return -Math.PI / 2;
                case 1 /* Left */:
                    return Math.PI;
                case 3 /* Right */:
                    return 0;
                case 2 /* Down */:
                    return -Math.PI * 3 / 2;
            }
            return 0;
        };
        /**
         *  Gets the best approximate direction based on the given angle.
         */
        MovementHelper.getDirectionFromAngle = function (angle) {
            var game = KGAD.Game.Instance;
            var piOver4 = Math.PI / 4;
            var threePiOver4 = piOver4 * 3;
            if (angle <= piOver4 && angle > -piOver4) {
                return 3 /* Right */;
            }
            else if (angle <= threePiOver4 && angle > piOver4) {
                return 2 /* Down */;
            }
            else if (angle >= threePiOver4 || angle < -threePiOver4) {
                return 1 /* Left */;
            }
            else {
                return 0 /* Up */;
            }
            var origAngle = angle;
            angle = MovementHelper.convertAngle(angle);
            for (var i = 0, l = this.angleIncrements.length; i < l; ++i) {
                var increment = this.angleIncrements[i];
                if (angle >= increment.first && angle < increment.second) {
                    return increment.direction;
                }
            }
            console.error('no direction found for angle: ' + angle);
            return 3 /* Right */;
        };
        MovementHelper.getNameOfDirection = function (direction) {
            switch (parseInt(direction, 10)) {
                case 0 /* Up */:
                    return "up";
                case 2 /* Down */:
                    return "down";
                case 1 /* Left */:
                    return "left";
                case 3 /* Right */:
                    return "right";
            }
            return "null";
        };
        MovementHelper.angleIncrements = [
            { first: 0, second: Math.PI / 4, direction: 1 /* Left */ },
            { first: Math.PI / 4, second: (3 * Math.PI) / 4, direction: 0 /* Up */ },
            { first: (3 * Math.PI) / 4, second: (5 * Math.PI) / 4, direction: 3 /* Right */ },
            { first: (5 * Math.PI) / 4, second: (7 * Math.PI) / 4, direction: 2 /* Down */ },
            { first: (7 * Math.PI) / 4, second: (2 * Math.PI) + 1, direction: 1 /* Left */ },
        ];
        return MovementHelper;
    })();
    KGAD.MovementHelper = MovementHelper;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var AniamtedSpriteActivator = (function () {
        function AniamtedSpriteActivator(typ) {
            this.typ = typ;
        }
        AniamtedSpriteActivator.prototype.getNew = function (game, x, y, key, frame) {
            return new this.typ(game, x, y, key, frame);
        };
        return AniamtedSpriteActivator;
    })();
    KGAD.AniamtedSpriteActivator = AniamtedSpriteActivator;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var AnimationLoader = (function () {
        function AnimationLoader() {
        }
        /**
         *  Loads the assets for a spritesheet and returns the promise handler.
         */
        AnimationLoader.load = function (name, callback, typ, baseurl) {
            if (baseurl === void 0) { baseurl = 'assets/textures/characters/'; }
            var spritesUrl = baseurl + name + '.sprites';
            var animUrl = baseurl + name + '.anim';
            ++AnimationLoader.animationDataParsed;
            var spriteLoader = AnimationLoader.loadItem(spritesUrl);
            var animLoader = AnimationLoader.loadItem(animUrl);
            $.when(spriteLoader, animLoader).done(function (spriteXml, animXml) {
                try {
                    return AnimationLoader.parseXml(name, spriteXml, animXml, callback, typ, baseurl);
                }
                finally {
                    --AnimationLoader.animationDataParsed;
                }
            });
        };
        Object.defineProperty(AnimationLoader, "done", {
            /**
             *  Checks if the animation loader has finished loading all animations.
             */
            get: function () {
                return AnimationLoader.loadCount === 0 && AnimationLoader.animationDataParsed === 0;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Parse spritesheet and animation XML data.
         */
        AnimationLoader.parseXml = function (name, spriteXml, animXml, callback, typ, baseurl) {
            var game = KGAD.Game.Instance;
            var image = null;
            $(spriteXml).find('img').each(function (idx, e) {
                var imgName = $(this).attr('name');
                var url = baseurl + imgName;
                image = { name: name, url: url };
            });
            var spriteDefinitions = KGAD.SpriteDefinition.fromXml(spriteXml);
            var animationDefinitions = KGAD.AnimationDefinition.fromXml(animXml);
            var animations = [];
            var frames = {};
            for (var i = 0, l = animationDefinitions.length; i < l; ++i) {
                var names = [];
                var anim = animationDefinitions[i];
                var delay = 1;
                var loops = anim.loops === 0;
                var cells = anim.cells;
                for (var j = 0, m = cells.length; j < m; ++j) {
                    var cell = cells[j];
                    var delay = Math.max(delay, cell.delay);
                    var sprites = cell.sprites;
                    for (var k = 0, n = sprites.length; k < n; ++k) {
                        var animSprite = sprites[k];
                        var sprite = AnimationLoader.lookup(animSprite.name, spriteDefinitions);
                        var filename = sprite.name;
                        var frameData = {
                            x: sprite.x,
                            y: sprite.y,
                            w: sprite.w,
                            h: sprite.h,
                        };
                        var rotated = false;
                        var trimmed = true;
                        var sourceSize = {
                            w: sprite.w,
                            h: sprite.h,
                        };
                        var spriteSourceSize = {
                            x: animSprite.x,
                            y: animSprite.y,
                            w: sprite.w,
                            h: sprite.h,
                        };
                        var frameInfo = {
                            filename: filename,
                            frame: frameData,
                            rotated: rotated,
                            trimmed: trimmed,
                            spriteSourceSize: spriteSourceSize,
                            sourceSize: sourceSize,
                        };
                        names.push(filename);
                        frames[filename] = frameInfo;
                    }
                }
                animations.push({
                    name: anim.name,
                    frames: names,
                    frameRate: delay,
                    loops: loops
                });
            }
            frames = { frames: frames };
            var keys = [];
            var filesToLoad = 0;
            var loader = null;
            loader = game.load.image(image.name, image.url);
            keys.push(image.name);
            filesToLoad++;
            game.load.atlasJSONHash(name, image.url, null, frames);
            keys.push(name);
            filesToLoad++;
            var loaderCallback = null;
            loaderCallback = function (p, key, successful, b, c) {
                if (keys.indexOf(key) >= 0) {
                    filesToLoad--;
                }
                if (filesToLoad === 0) {
                    game.cache.addJSON(name, null, animations);
                    var activator = new KGAD.AniamtedSpriteActivator(typ);
                    var finalSprite = activator.getNew(game, 0, 0, name);
                    for (var i = 0, l = animations.length; i < l; ++i) {
                        var animation = animations[i];
                        var rate = animation.frameRate;
                        // Make darkEditor and Phaser animation play nicely together.
                        // In darkEditor, animation plays according to this speed:
                        // 1. Set the frame counter to <delay> (integer >= 1).
                        // 2. Every 30ms, decrement the frame counter by 1.
                        // 3. When the frame counter reaches 0, switch to a new frame.
                        // Therefore, if you set the delay to 10, the time per frame is 300ms. If it's 11, the time per frame is 330ms.
                        // Phaser takes the frameRate input and calculates the delay between frames like: 1000 / frameRate.
                        rate = 1000 / (30 - (30 * (1 - rate)));
                        finalSprite.animations.add(animation.name, animation.frames, rate, animation.loops);
                    }
                    loader.onFileComplete.remove(loaderCallback);
                    callback(finalSprite);
                }
            };
            loader.onFileComplete.add(loaderCallback);
            return null;
        };
        AnimationLoader.addAnimationToSprite = function (sprite, animationKey) {
            var rate = 0;
            var animationData;
            if (typeof animationKey === 'string') {
                animationData = KGAD.Game.Instance.cache.getJSON(animationKey);
                for (var j = 0, len = animationData.length; j < len; ++j) {
                    var animation = animationData[j];
                    rate = 1000 / (30 - (30 * (1 - animation.frameRate)));
                    sprite.animations.add(animation.name, animation.frames, rate, animation.loops);
                }
            }
            else {
                rate = 1000 / (30 - (30 * (1 - animationKey.frameRate)));
                sprite.animations.add(animationKey.name, animationKey.frames, rate, animationKey.loops);
            }
        };
        /**
         *  Looks for a sprite by name in a list of sprites.
         */
        AnimationLoader.lookup = function (name, sprites) {
            var sprite = null;
            for (var i = 0, l = sprites.length; i < l; ++i) {
                var testSprite = sprites[i];
                if (testSprite.fullPath === name) {
                    sprite = testSprite;
                    break;
                }
            }
            return sprite;
        };
        /**
         *  Load an item and return an AJAX promise.
         */
        AnimationLoader.loadItem = function (url) {
            ++AnimationLoader.loadCount;
            return $.ajax({
                url: url,
                async: true,
                dataType: "xml",
            }).done(AnimationLoader.handleItemLoaded).fail(AnimationLoader.handleItemError);
        };
        /**
         *  Handler called once an item is loaded.
         */
        AnimationLoader.handleItemLoaded = function (item) {
            --AnimationLoader.loadCount;
        };
        /**
         *  Handler called when an item fails to load.
         */
        AnimationLoader.handleItemError = function (item) {
            --AnimationLoader.loadCount;
            --AnimationLoader.animationDataParsed;
            console.error(item);
        };
        AnimationLoader.loadCount = 0;
        AnimationLoader.animationDataParsed = 0;
        return AnimationLoader;
    })();
    KGAD.AnimationLoader = AnimationLoader;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var AnimationCellDefinition = (function () {
        function AnimationCellDefinition(index, delay, sprites) {
            if (sprites === void 0) { sprites = []; }
            this.index = index;
            this.delay = delay;
            this.sprites = sprites;
        }
        return AnimationCellDefinition;
    })();
    KGAD.AnimationCellDefinition = AnimationCellDefinition;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var AnimationDefinition = (function () {
        function AnimationDefinition(name, loops, cells) {
            this.name = name;
            this.loops = loops;
            this.cells = cells;
        }
        /**
         *  Parses animation data from a darkEditor animation XML file.
         */
        AnimationDefinition.fromXml = function (animXml) {
            var animations = [];
            $(animXml).find('anim').each(function (idx, el) {
                var name = $(this).attr('name');
                var loops = parseInt($(this).attr('loops'), 10);
                var cells = [];
                $('> cell', $(this)).each(function (i, e) {
                    var index = parseInt($(this).attr('index'), 10);
                    var delay = parseInt($(this).attr('delay'), 10);
                    var sprites = [];
                    $('> spr', $(this)).each(function (iidx, eel) {
                        var spriteName = $(this).attr('name');
                        var x = parseInt($(this).attr('x'), 10);
                        var y = parseInt($(this).attr('y'), 10);
                        var z = parseInt($(this).attr('z'), 10);
                        var sprite = new KGAD.AnimationSpriteDefinition(spriteName, x, y, z);
                        sprites.push(sprite);
                    });
                    var cell = new KGAD.AnimationCellDefinition(index, delay, sprites);
                    cells.push(cell);
                });
                var animation = new AnimationDefinition(name, loops, cells);
                animations.push(animation);
            });
            return animations;
        };
        return AnimationDefinition;
    })();
    KGAD.AnimationDefinition = AnimationDefinition;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var AnimationSpriteDefinition = (function () {
        function AnimationSpriteDefinition(name, x, y, z) {
            this.name = name;
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return AnimationSpriteDefinition;
    })();
    KGAD.AnimationSpriteDefinition = AnimationSpriteDefinition;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var EnemySpecification = (function () {
        function EnemySpecification(key, movementSpeed, health, armor) {
            if (armor === void 0) { armor = 0; }
            this.key = key;
            this.movementSpeed = movementSpeed;
            this.health = health;
            this.armor = armor;
        }
        return EnemySpecification;
    })();
    KGAD.EnemySpecification = EnemySpecification;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var SpriteDefinition = (function () {
        function SpriteDefinition(fullPath, x, y, w, h) {
            this.fullPath = fullPath;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        Object.defineProperty(SpriteDefinition.prototype, "name", {
            /**
             *  Gets the full name of the sprite, including the path to the spritesheet.
             */
            get: function () {
                return this.fullPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteDefinition.prototype, "nameOnly", {
            /**
             *  Gets the name of the sprite without the path.
             */
            get: function () {
                var i = this.fullPath.lastIndexOf('/');
                if (i < 0) {
                    return this.fullPath;
                }
                return this.fullPath.substr(i + 1);
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Parses XML created by the darkEditor software.
         */
        SpriteDefinition.fromXml = function (spriteXml) {
            var $img = $(spriteXml).find('img');
            var sprites = [];
            $img.each(function (index, elem) {
                var imgName = $(this).attr('name');
                var imgWidth = parseInt($(this).attr('w'), 10);
                var imgHeight = parseInt($(this).attr('h'), 10);
                var $definitions = $(this).find('definitions').first();
                var allSprites = SpriteDefinition.findSprites($definitions, '');
                sprites = sprites.concat(allSprites);
            });
            return sprites;
        };
        /**
         *  Loops through the <dir> elements of the XML file and grabs all of the sprites.
         */
        SpriteDefinition.findSprites = function ($rootDir, dirName, sprites) {
            if (sprites === void 0) { sprites = []; }
            $('> dir', $rootDir).each(function (i, e) {
                var subDirName = dirName + $(this).attr('name');
                if (!subDirName.match(/\/$/)) {
                    subDirName += '/';
                }
                $('> spr', $(this)).each(function (idx, el) {
                    var fullPath = subDirName + $(this).attr('name');
                    var x = parseInt($(this).attr('x'), 10);
                    var y = parseInt($(this).attr('y'), 10);
                    var w = parseInt($(this).attr('w'), 10);
                    var h = parseInt($(this).attr('h'), 10);
                    sprites.push(new SpriteDefinition(fullPath, x, y, w, h));
                });
                sprites = SpriteDefinition.findSprites($(this), subDirName, sprites);
            });
            return sprites;
        };
        return SpriteDefinition;
    })();
    KGAD.SpriteDefinition = SpriteDefinition;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var WeaponSpecification = (function () {
        function WeaponSpecification(key, cooldown, velocity) {
            this.key = key;
            this.cooldown = cooldown;
            this.velocity = velocity;
        }
        WeaponSpecification.fromJson = function (jsonData) {
            var results = [];
            if (!jsonData.weapons) {
                throw new Error("Cannot parse: JSON data must contain 'weapons' block.");
            }
            return results;
        };
        return WeaponSpecification;
    })();
    KGAD.WeaponSpecification = WeaponSpecification;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var CollisionHelper = (function () {
        function CollisionHelper() {
        }
        CollisionHelper.raycast = function (line, stepRate) {
            if (stepRate === void 0) { stepRate = 4; }
            var map = KGAD.Game.CurrentMap;
            var enemies = KGAD.Game.Enemies;
            var hits = [];
            if (line instanceof Array) {
                for (var i = 0, l = line.length; i < l; ++i) {
                    var _line = line[i];
                    var tileHits = map.collisionLayer.getRayCastTiles(_line, stepRate, true, false);
                    for (var j = 0, m = tileHits.length; j < m; ++j) {
                        var hit = tileHits[j];
                        if (hits.indexOf(hit) < 0) {
                            hits.push(hit);
                        }
                    }
                }
            }
            else {
                hits = map.collisionLayer.getRayCastTiles(line, stepRate, true, false);
            }
            return hits;
        };
        /**
         *  Performs a raycast for sprites.
         */
        CollisionHelper.raycastForSprites = function (line, stepRate, requestor) {
            if (stepRate === void 0) { stepRate = 4; }
            var map = KGAD.Game.CurrentMap;
            var enemies = KGAD.Game.Enemies;
            var coords;
            var spriteHits;
            var game = KGAD.Game.Instance;
            var _line;
            var grid = KGAD.OccupiedGrid;
            var undef;
            if (line instanceof Array) {
                for (var i = 0, l = line.length; i < l; ++i) {
                    _line: Phaser.Line = line[i];
                    coords = _line.coordinatesOnLine(stepRate, undef);
                    spriteHits = [];
                    for (var k = 0, n = coords.length; k < n; ++k) {
                        var coord = coords[k];
                        var occupant = grid.getOccupantOfInPixels(coord);
                        if (occupant != null) {
                            if (occupant === requestor) {
                                continue;
                            }
                            else {
                                spriteHits.push(occupant);
                            }
                        }
                    }
                }
            }
            else {
                _line = line;
                coords = _line.coordinatesOnLine(stepRate, undef);
                spriteHits = [];
                for (var k = 0, n = coords.length; k < n; ++k) {
                    var coord = coords[k];
                    var tileCoord = map.fromPixels(new Phaser.Point(coord[0], coord[1]));
                    var occupant = grid.getOccupantOfInPixels(coord);
                    if (occupant != null) {
                        if (occupant === requestor) {
                            continue;
                        }
                        else {
                            spriteHits.push(occupant);
                        }
                        break;
                    }
                }
            }
            return spriteHits;
        };
        return CollisionHelper;
    })();
    KGAD.CollisionHelper = CollisionHelper;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var PathMovementMachine = (function () {
        function PathMovementMachine(parent) {
            this._parent = parent;
            this._path = null;
        }
        Object.defineProperty(PathMovementMachine.prototype, "currentPath", {
            get: function () {
                return this._path;
            },
            set: function (path) {
                this._path = path;
            },
            enumerable: true,
            configurable: true
        });
        PathMovementMachine.prototype.setCurrentPath = function (path) {
            this.currentPath = KGAD.OccupiedGrid.convertToGridPath(path);
        };
        /**
         *  Gets the indices of the next node in the path.
         */
        PathMovementMachine.prototype.getNextGridIndices = function () {
            if (this._path == null) {
                return null;
            }
            var rect = this._path.peek();
            if (rect == null) {
                return [];
            }
            return KGAD.OccupiedGrid.getIndicesOfRect(rect);
        };
        PathMovementMachine.prototype.update = function () {
        };
        PathMovementMachine.prototype.render = function () {
            var debug = this._parent.game.debug;
            if (this._path != null) {
                for (var i = 0, l = this._path.length; i < l; ++i) {
                    var node = this._path.at(i);
                    debug.geom(node, '#FF3333', false);
                }
            }
        };
        return PathMovementMachine;
    })();
    KGAD.PathMovementMachine = PathMovementMachine;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var CustomPathfindingGridNode = (function () {
        function CustomPathfindingGridNode(x, y, weight) {
            this.x = x;
            this.y = y;
            this.weight = weight;
        }
        return CustomPathfindingGridNode;
    })();
    KGAD.CustomPathfindingGridNode = CustomPathfindingGridNode;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var GameMap = (function () {
        function GameMap(mapName) {
            this.game = KGAD.Game.Instance;
            this.mapName = mapName;
            this.enemySpawns = [];
            this.loadJsonData();
        }
        Object.defineProperty(GameMap.prototype, "name", {
            /**
             *  Gets the map name.
             */
            get: function () {
                return this.mapName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "ready", {
            /**
             *  Gets whether or not the game map is ready to load it's assets.
             */
            get: function () {
                return this.loaded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "heroSpawnPoint", {
            /**
             *  Gets the (x, y) position (in tiles) of the hero spawn point.
             */
            get: function () {
                return this.heroSpawn;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "kingSpawnPoint", {
            /**
             *  Gets the (x, y) position of the king's spawn point.
             */
            get: function () {
                return this.kingSpawn;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "collisionLayer", {
            /**
             *  Gets the collision layer.
             */
            get: function () {
                return this.collision;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "width", {
            get: function () {
                return this.tilemap.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "widthInPixels", {
            get: function () {
                return this.tilemap.widthInPixels;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "height", {
            get: function () {
                return this.tilemap.height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameMap.prototype, "heightInPixels", {
            get: function () {
                return this.tilemap.heightInPixels;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Converts a tile numeric value to pixels.
         */
        GameMap.prototype.toPixels = function (x) {
            if (typeof x === 'number') {
                return x * GameMap.TILE_WIDTH;
            }
            else {
                return Phaser.Point.multiply(x, new Phaser.Point(GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT));
            }
        };
        /**
         *  Converts a number or point to tile coordinates.
         */
        GameMap.prototype.fromPixels = function (num) {
            if (typeof num === 'number') {
                return Math.floor(num / GameMap.TILE_WIDTH);
            }
            else {
                return new Phaser.Point(Math.floor(num.x / GameMap.TILE_WIDTH), Math.floor(num.y / GameMap.TILE_HEIGHT));
            }
        };
        /**
         *  Finds the shortest path from the given point to the given point (in tiles).
         */
        GameMap.prototype.findPath = function (from, to, fullSearch) {
            if (fullSearch === void 0) { fullSearch = false; }
            if (from.x < 0 || from.x >= this.width || from.y < 0 || from.y >= this.height) {
                throw new RangeError("Pathfinding: 'from' coordinate is out of range: (" + from.x + ", " + from.y + ") width=" + this.width + ", height=" + this.height);
            }
            if (to.x < 0 || to.x >= this.width || to.y < 0 || to.y >= this.height) {
                throw new RangeError("Pathfinding: 'to' coordinate is out of range: (" + to.x + ", " + to.y + ")");
            }
            return this.pathfinder.findPath(from, to, fullSearch);
        };
        /**
         *  Preloads assets. Should be called during the 'preload' Phaser phase.
         */
        GameMap.prototype.preload = function () {
            var url = "assets/maps/" + this.mapName + ".json?t=" + Date.now();
            this.game.load.tilemap(this.mapName, url, null, Phaser.Tilemap.TILED_JSON);
            for (var i = 0, l = this.tilesetNames.length; i < l; ++i) {
                var name = this.tilesetNames[i];
                var imageUrl = "assets/tilesets/" + name + ".png";
                this.game.load.image(name, imageUrl);
            }
        };
        /**
         *  Creates tilemap assets. Should be called during the 'create' Phaser phase.
         */
        GameMap.prototype.create = function () {
            this.tilemap = this.game.add.tilemap(this.mapName, GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT);
            this.tilesets = this.tilemap.tilesets;
            for (var i = 0, l = this.tilesetNames.length; i < l; ++i) {
                var tilesetName = this.tilesetNames[i];
                this.tilemap.addTilesetImage(tilesetName);
            }
            this.createLayers();
            KGAD.OccupiedGrid.currentMap = this;
            this.pathfinder = new KGAD.Pathfinding(this);
        };
        /**
         *  Checks if the given tile coordinate is out of bounds.
         */
        GameMap.prototype.isOutOfBounds = function (x, y) {
            var _x, _y;
            if (typeof x === 'number') {
                _x = x;
                _y = y;
            }
            else {
                _x = x.x;
                _y = x.y;
            }
            return (_x < 0 || _y < 0 || _x >= this.width || _y >= this.height);
        };
        /**
         *  Check if the given tile coordinate is a wall.
         */
        GameMap.prototype.isWall = function (x, y) {
            var p = this.toPixels(new Phaser.Point(x, y));
            return this.isWallInPixelCoordinates(p.x, p.y);
        };
        /**
         *  Checks if the given pixel coordinate is a wall.
         */
        GameMap.prototype.isWallInPixelCoordinates = function (x, y) {
            var collidingTiles = this.collisionLayer.getTiles(x, y, GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT, true);
            return collidingTiles != null && collidingTiles.length > 0;
        };
        /**
         *  Loads JSON file from the URL built from the map name.
         */
        GameMap.prototype.loadJsonData = function () {
            var _this = this;
            this.loaded = false;
            var filename = "assets/maps/" + this.mapName + ".json?t=" + Date.now();
            $.getJSON(filename, function (data, textStatus, jqXHR) {
                _this.tilesetNames = new Array();
                var tileSets = data.tilesets;
                for (var i = 0, l = tileSets.length; i < l; ++i) {
                    var tileset = tileSets[i];
                    var name = tileset.name;
                    _this.tilesetNames.push(name);
                }
                _this.loaded = true;
            });
        };
        /**
         *  Creates the tileset layers.
         */
        GameMap.prototype.createLayers = function () {
            for (var i = 0, l = this.tilemap.layers.length; i < l; ++i) {
                var layerData = this.tilemap.layers[i];
                var isCollisionLayer = false;
                var isVisible = true;
                if (layerData.properties.hasOwnProperty("collision_layer")) {
                    isCollisionLayer = true;
                    isVisible = false;
                }
                var layer = this.tilemap.createLayer(layerData.name, layerData.widthInPixels, layerData.heightInPixels);
                layer.visible = isVisible;
                if (isCollisionLayer) {
                    this.collision = layer;
                    var indices = [];
                    var tiles = layer.getTiles(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
                    for (var j = 0, k = tiles.length; j < k; ++j) {
                        var tile = tiles[j];
                        if (!this.checkProperty(tile.properties, "can_pass", true)) {
                            tile.canCollide = true;
                            if (indices.indexOf(tile.index) < 0) {
                                this.tilemap.setCollisionByIndex(tile.index, true, layer.index, true);
                                indices.push(tile.index);
                            }
                        }
                        else if (this.checkProperty(tile, "spawn_point")) {
                            this.heroSpawn = new Phaser.Point(tile.x, tile.y);
                        }
                        else if (this.checkProperty(tile, "king_spawn_point")) {
                            this.kingSpawn = new Phaser.Point(tile.x, tile.y);
                        }
                        else if (this.checkProperty(tile, "enemy_spawn")) {
                            this.enemySpawns.push(new Phaser.Point(tile.x, tile.y));
                        }
                    }
                }
                layer.resizeWorld();
            }
            //this.game.physics.arcade.setBoundsToWorld();
            //this.game.world.setBounds(0, 0, this.widthInPixels, this.heightInPixels);
        };
        /**
         *  Checks if a property is set, and if so, if that property is true.
         *  If it is not set, set the default value given (or false) is returned instead. Otherwise, the result is the
         *  parsed boolean value from the property.
         */
        GameMap.prototype.checkProperty = function (tile, key, defaultValue) {
            if (defaultValue === void 0) { defaultValue = false; }
            var props = tile;
            if (tile instanceof Phaser.Tile) {
                props = tile.properties;
            }
            var result = defaultValue;
            if (props.hasOwnProperty(key)) {
                var value = props[key];
                result = value === true || value === "true" || value === 1 || value === "1";
            }
            return result;
        };
        GameMap.TILE_WIDTH = 32;
        GameMap.TILE_HEIGHT = 32;
        return GameMap;
    })();
    KGAD.GameMap = GameMap;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var OccupiedGrid = (function () {
        function OccupiedGrid() {
        }
        Object.defineProperty(OccupiedGrid, "NODE_SIZE", {
            get: function () {
                return 16;
            } // 16x16
            ,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OccupiedGrid, "width", {
            /**
             *  Gets the current width of the occupied grid.
             */
            get: function () {
                return OccupiedGrid._width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OccupiedGrid, "height", {
            /**
             *  Gets the current height of the occupied grid.
             */
            get: function () {
                return OccupiedGrid._height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OccupiedGrid, "currentMap", {
            /**
             *  Gets the current GameMap instance.
             */
            get: function () {
                return OccupiedGrid._map;
            },
            /**
             *  Sets the current GameMap instance. Changing this value will reset the grid.
             */
            set: function (map) {
                OccupiedGrid._map = map;
                OccupiedGrid.reset();
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Gets all occupants within the pixel rectangle.
         */
        OccupiedGrid.getOccupantsInBounds = function (bounds) {
            var top = new Phaser.Line(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y);
            var left = new Phaser.Line(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
            var bottom = new Phaser.Line(bounds.x, bounds.y + bounds.height, bounds.x + bounds.width, bounds.y + bounds.height);
            var right = new Phaser.Line(bounds.x + bounds.width, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height);
            var lines = [
                top,
                left,
                bottom,
                right
            ];
            var occupants = [];
            for (var i = 0, l = lines.length; i < l; ++i) {
                var line = lines[i];
                var coords = [];
                line.coordinatesOnLine(OccupiedGrid.NODE_SIZE / 2, coords);
                for (var j = 0, m = coords.length; j < m; ++j) {
                    var coord = coords[j];
                    var idx = OccupiedGrid.getIndexAtPixelCoordinate(coord.x, coord.y);
                    var occupant = OccupiedGrid._grid[idx] || null;
                    if (occupant != null && $.inArray(occupant, occupants) < 0) {
                        occupants.push(occupant);
                    }
                }
            }
            return occupants;
        };
        /**
         *  Checks if the cell at map tile coordinate (x, y) is occupied.
         */
        OccupiedGrid.isOccupiedInTiles = function (x, y) {
            var p = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            p = new Phaser.Point(p.x * KGAD.GameMap.TILE_WIDTH, p.y * KGAD.GameMap.TILE_HEIGHT).divide(OccupiedGrid.NODE_SIZE, OccupiedGrid.NODE_SIZE);
            return OccupiedGrid.isOccupied(p.x, p.y);
        };
        /**
         *  Checks if the cell at pixel coordinate (x, y) is occupied.
         */
        OccupiedGrid.isOccupiedInPixels = function (x, y) {
            var p = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }
            return OccupiedGrid.isOccupied(p);
        };
        /**
         *  Checks if the cell at tile coordinate (x, y) is occupied.
         */
        OccupiedGrid.isOccupied = function (x, y) {
            var p = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            var idx = p.y * OccupiedGrid.width + p.x;
            if (idx < 0 || idx >= OccupiedGrid._grid.length) {
                return true;
            }
            var occupant = OccupiedGrid._grid[idx];
            return occupant != null;
        };
        /**
         *  Gets the occupant of the (x, y) map tile coordinate.
         */
        OccupiedGrid.getOccupantOfInTiles = function (x, y) {
            var p = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            p = new Phaser.Point(p.x * KGAD.GameMap.TILE_WIDTH, p.y * KGAD.GameMap.TILE_HEIGHT).divide(OccupiedGrid.NODE_SIZE, OccupiedGrid.NODE_SIZE);
            return OccupiedGrid.getOccupantOf(p);
        };
        /**
         *  Gets the occupant of the (x, y) pixel coordinate.
         */
        OccupiedGrid.getOccupantOfInPixels = function (x, y) {
            var p = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }
            return OccupiedGrid.getOccupantOf(p);
        };
        /**
         *  Gets the occupant of the (x, y) tile coordinate.
         */
        OccupiedGrid.getOccupantOf = function (x, y) {
            var p = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            var idx = p.y * OccupiedGrid.width + p.x;
            if (idx < 0 || idx >= OccupiedGrid._grid.length) {
                return null;
            }
            var occupant = OccupiedGrid._grid[idx];
            return occupant;
        };
        /**
         *  Gets the pathfinding weight of the given (x, y) pixel coordinate.
         */
        OccupiedGrid.getWeightOfInPixelCoordinates = function (x, y) {
            var p = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }
            return OccupiedGrid.getWeightOf(p);
        };
        /**
         *  Gets the weight of the given (x, y) map tile coordinate.
         */
        OccupiedGrid.getWeightOfInTileCoordinates = function (x, y) {
            var p = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            p = new Phaser.Point(p.x * KGAD.GameMap.TILE_WIDTH, p.y * KGAD.GameMap.TILE_HEIGHT).divide(OccupiedGrid.NODE_SIZE, OccupiedGrid.NODE_SIZE);
            return OccupiedGrid.getWeightOf(p);
        };
        /**
         *  Gets the weight of the given (x, y) grid tile coordinate.
         */
        OccupiedGrid.getWeightOf = function (x, y) {
            var p = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            var weight = 1;
            var occupant = OccupiedGrid.getOccupantOf(p);
            if (occupant == null) {
                var map = OccupiedGrid._map;
                var tileCoordinate = new Phaser.Point(p.x * OccupiedGrid.NODE_SIZE, p.y * OccupiedGrid.NODE_SIZE);
                if (map.isWallInPixelCoordinates(tileCoordinate.x, tileCoordinate.y)) {
                    weight = 0;
                }
            }
            else {
                weight = occupant.weight;
            }
            return weight;
        };
        /**
         *  Gets the index of the (x, y) pixel coordinate. If it's out of bounds, -1 is returned.
         */
        OccupiedGrid.getIndexAtPixelCoordinate = function (x, y) {
            var map = OccupiedGrid._map;
            var _tX = Math.floor(x / KGAD.GameMap.TILE_WIDTH);
            var _tY = Math.floor(y / KGAD.GameMap.TILE_HEIGHT);
            if (map.isWall(_tX, _tY)) {
                return -1;
            }
            var size = OccupiedGrid.NODE_SIZE;
            var _x = Math.floor(x / size);
            var _y = Math.floor(y / size);
            var idx = _y * OccupiedGrid.width + _x;
            if (idx >= OccupiedGrid._grid.length || idx < 0) {
                return -1;
            }
            return idx;
        };
        /**
         *  Gets the (x, y, width, height) bounds of a sprite.
         */
        OccupiedGrid.getBoundsOfSprite = function (sprite) {
            var bounds = OccupiedGrid.getBoundsAtCenter(sprite.position);
            return bounds;
        };
        /**
         *  Returns an array containing all grid indices that a sprite currently occupies.
         */
        OccupiedGrid.getIndicesOfSprite = function (sprite, allowNegativeOne) {
            if (allowNegativeOne === void 0) { allowNegativeOne = false; }
            var bounds = OccupiedGrid.getBoundsOfSprite(sprite);
            return OccupiedGrid.getIndicesOfRect(bounds, allowNegativeOne);
        };
        /**
         *  Returns an array containing all grid indices that a rectangle occupies.
         */
        OccupiedGrid.getIndicesOfRect = function (rect, allowNegativeOne) {
            if (allowNegativeOne === void 0) { allowNegativeOne = false; }
            var result = [];
            var indices = [];
            indices[0] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x, rect.y);
            indices[1] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x + rect.width, rect.y);
            indices[2] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x + rect.width, rect.y + rect.height);
            indices[3] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x, rect.y + rect.height);
            for (var i = 0; i < 4; ++i) {
                var idx = indices[i];
                if (idx === -1 && !allowNegativeOne) {
                    continue;
                }
                if ($.inArray(idx, result) < 0) {
                    result.push(idx);
                }
            }
            return result;
        };
        /**
         *  Resets the grid.
         */
        OccupiedGrid.reset = function () {
            var map = OccupiedGrid._map;
            var w = map.width * 2;
            var h = map.height * 2;
            var size = w * h;
            var grid = [];
            for (var i = 0; i < size; ++i) {
                grid.push(null);
            }
            OccupiedGrid._grid = grid;
            OccupiedGrid._reservations = [];
            OccupiedGrid._width = w;
            OccupiedGrid._height = h;
        };
        /**
         *  Removes a sprite from the grid.
         */
        OccupiedGrid.remove = function (sprite) {
            var removed = false;
            var idx = -1;
            var grid = OccupiedGrid._grid;
            idx = $.inArray(sprite, grid);
            while (idx >= 0) {
                grid[idx] = null;
                removed = true;
                idx = $.inArray(sprite, grid, idx);
            }
            return removed;
        };
        /**
         *  Checks if the given sprite can occupy the given (x, y) map tile coordinate.
         */
        OccupiedGrid.canOccupyInTiles = function (sprite, x, y, collisions) {
            if (collisions === void 0) { collisions = []; }
            var p = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(x * KGAD.GameMap.TILE_WIDTH, y * KGAD.GameMap.TILE_HEIGHT);
            }
            else {
                p = new Phaser.Point(x.x * KGAD.GameMap.TILE_WIDTH, x.y * KGAD.GameMap.TILE_HEIGHT);
            }
            return OccupiedGrid.canOccupyInPixels(sprite, p, null, collisions);
        };
        /**
         *  Checks if the given sprite can occupy the given (x, y) pixel coordinate.
         */
        OccupiedGrid.canOccupyInPixels = function (sprite, x, y, collisions) {
            if (collisions === void 0) { collisions = []; }
            var p = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }
            return OccupiedGrid.canOccupy(sprite, p, null, collisions);
        };
        /**
         *  Checks if the given sprite can occupy the given (x, y) tile coordinate.
         */
        OccupiedGrid.canOccupy = function (sprite, x, y, collisions) {
            if (collisions === void 0) { collisions = []; }
            var p = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            var indices;
            if (sprite == null) {
                var pixelPos = new Phaser.Point(p.x * OccupiedGrid.NODE_SIZE, p.y * OccupiedGrid.NODE_SIZE);
                indices = OccupiedGrid.getIndicesOfRect(OccupiedGrid.getBoundsAtCenter(pixelPos), true);
            }
            else {
                indices = OccupiedGrid.getIndicesOfSprite(sprite, true);
            }
            if ($.inArray(-1, indices) >= 0) {
                return false;
            }
            var grid = OccupiedGrid._grid;
            for (var i = 0, l = indices.length; i < l; ++i) {
                var idx = indices[i];
                var occupant = grid[idx];
                if (occupant != null) {
                    if (sprite == null || occupant !== sprite) {
                        collisions.push(occupant);
                        return false;
                    }
                }
            }
            return true;
        };
        /**
         *  Gets the collision bounds for a sprite at the given point.
         */
        OccupiedGrid.getBoundsAtCenter = function (x, y) {
            var p;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }
            return {
                x: p.x - 8,
                y: p.y - 8,
                width: 16,
                height: 16,
            };
        };
        /**
         *  Reserves a spot for our sprite in the near future.
         */
        OccupiedGrid.reserve = function (sprite, position) {
            var savePosition = sprite.position;
            sprite.position = position;
            var indices = OccupiedGrid.getIndicesOfSprite(sprite);
            sprite.position = savePosition;
            if ($.inArray(-1, indices) < 0) {
                return false;
            }
            var grid = OccupiedGrid._grid;
            for (var i = 0, l = indices.length; i < l; ++i) {
                var idx = indices[i];
                var occupant = grid[idx];
                if (occupant != null && occupant !== sprite) {
                    return false;
                }
                var reservedBy = OccupiedGrid.getReservationForIndex(idx);
                if (reservedBy != null && reservedBy !== sprite) {
                    return false;
                }
            }
            var reservation = {
                sprite: sprite,
                indices: indices
            };
            OccupiedGrid._reservations.push(reservation);
            return true;
        };
        /**
         *  Gets who, if anyone, has reserved an index.
         */
        OccupiedGrid.getReservationForIndex = function (index) {
            var who = null;
            var cleanup = [];
            var reservations = OccupiedGrid._reservations;
            for (var i = 0, l = reservations.length; i < l; ++i) {
                var reservation = reservations[i];
                var sprite = reservation.sprite;
                if (!sprite.alive || !sprite.exists || sprite.health <= 0) {
                    cleanup.push(reservation);
                }
                else if ($.inArray(index, reservation.indices)) {
                    who = reservation.sprite;
                    break;
                }
            }
            for (var j = 0, k = cleanup.length; j < k; ++j) {
                OccupiedGrid._reservations.splice($.inArray(cleanup[j], reservations), 1);
            }
            return who;
        };
        /**
         *  Gets all reservations for any indices.
         */
        OccupiedGrid.getReservationsForIndices = function (indices) {
            var sprites = [];
            for (var i = 0, l = indices.length; i < l; ++i) {
                var idx = indices[i];
                sprites.push(OccupiedGrid.getReservationForIndex(idx));
            }
            return sprites;
        };
        /**
         *  Remove the given indices/reservations.
         */
        OccupiedGrid.removeReservations = function (sprite, indices) {
            var reservations = OccupiedGrid._reservations;
            var cleanup = [];
            for (var i = 0, l = reservations.length; i < l; ++i) {
                var reservation = reservations[i];
                if (reservation.sprite === sprite) {
                    if (indices) {
                        for (var j = 0, m = indices.length; j < m; ++j) {
                            var idx = indices[j];
                            var reservationIdx = $.inArray(idx, reservation.indices);
                            if (reservationIdx >= 0) {
                                reservation.indices.splice(reservationIdx, 1);
                            }
                        }
                    }
                    else {
                        reservation.indices = [];
                    }
                }
                if (reservation.indices.length === 0) {
                    cleanup.push(reservation);
                }
            }
            for (i = 0, l = cleanup.length; i < l; ++i) {
                reservations.splice($.inArray(cleanup[i], reservations), 1);
            }
        };
        /**
         *  Converts a pathfinding path generated for a 32x32 tilemap and
         */
        OccupiedGrid.convertToGridPath = function (path) {
            var result = [];
            var w = KGAD.GameMap.TILE_WIDTH;
            var h = KGAD.GameMap.TILE_HEIGHT;
            var n = OccupiedGrid.NODE_SIZE;
            var game = KGAD.Game.Instance;
            var map = KGAD.Game.CurrentMap;
            if (path.length === 0) {
                return new KGAD.Path(result);
            }
            var first = map.toPixels(path.next());
            result.push(new Phaser.Rectangle(first.x, first.y, w, h));
            while (path.hasNext()) {
                var node1 = map.toPixels(path.next());
                var node2 = path.peek();
                result.push(new Phaser.Rectangle(node1.x, node1.y, w, h));
                if (node2 != null) {
                    node2 = map.toPixels(node2);
                    var angle = game.physics.arcade.angleBetween(node1, node2);
                    var distance = Phaser.Point.distance(node1, node2);
                    var xDiff = Math.cos(angle) * (distance / 2);
                    var yDiff = Math.sin(angle) * (distance / 2);
                    result.push(new Phaser.Rectangle(node1.x + xDiff, node1.y + yDiff, w, h));
                }
            }
            return new KGAD.Path(result);
        };
        /**
         *  Adds a sprite as the occupant of the grid.
         */
        OccupiedGrid.add = function (sprite) {
            if (!sprite.alive || !sprite.exists || sprite.health <= 0) {
                OccupiedGrid.removeReservations(sprite);
                OccupiedGrid.remove(sprite);
                return false;
            }
            OccupiedGrid.remove(sprite);
            var indices = OccupiedGrid.getIndicesOfSprite(sprite);
            var reservations = OccupiedGrid.getReservationsForIndices(indices);
            for (var k = 0, m = reservations.length; k < m; ++k) {
                var reservation = reservations[k];
                if (reservation != null && reservation !== sprite) {
                    return false;
                }
            }
            OccupiedGrid.removeReservations(sprite, indices);
            for (var j = 0, l = indices.length; j < l; ++j) {
                var idx = indices[j];
                if (idx !== -1) {
                    OccupiedGrid._grid[idx] = sprite;
                }
            }
            return true;
        };
        /**
         *  Loop through each occupant.
         */
        OccupiedGrid.forEach = function (callback, moreThanOnce) {
            if (moreThanOnce === void 0) { moreThanOnce = false; }
            var grid = OccupiedGrid._grid;
            var size = OccupiedGrid.width * OccupiedGrid.height;
            var processed = [];
            for (var i = 0; i < size; ++i) {
                var occupant = grid[i];
                if (occupant != null && $.inArray(occupant, processed) < 0) {
                    if (callback(occupant, i) === false) {
                        break;
                    }
                    if (!moreThanOnce) {
                        processed.push(occupant);
                    }
                }
            }
        };
        /**
         *  Update the occupied grid based on the positions of the sprites.
         */
        OccupiedGrid.update = function (sprite) {
            if (sprite == null) {
                OccupiedGrid.forEach(function (sprite, idx) {
                    OccupiedGrid.add(sprite);
                });
            }
            else {
                OccupiedGrid.add(sprite);
            }
        };
        /**
         *  Render the occupants of the grid as squares (debug).
         */
        OccupiedGrid.render = function () {
            var map = OccupiedGrid._map;
            var debug = KGAD.Game.Instance.debug;
            var w = OccupiedGrid._width;
            var h = OccupiedGrid._height;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    var occupant = OccupiedGrid.getOccupantOf(x, y);
                    if (occupant != null) {
                        var pixelX = x * nodeSize;
                        var pixelY = y * nodeSize;
                        debug.geom(new Phaser.Rectangle(pixelX, pixelY, nodeSize, nodeSize), '#FF6666', false);
                    }
                }
            }
        };
        return OccupiedGrid;
    })();
    KGAD.OccupiedGrid = OccupiedGrid;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var Path = (function () {
        function Path(path) {
            this.currentPath = path;
        }
        Object.defineProperty(Path.prototype, "currentPath", {
            /**
             *  Gets the current working path.
             */
            get: function () {
                return this._path;
            },
            /**
             *  Sets a new path and resets the index.
             */
            set: function (path) {
                this._path = path;
                this._idx = -1;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Sets the index back to it's original state.
         */
        Path.prototype.reset = function () {
            this._idx = -1;
        };
        Object.defineProperty(Path.prototype, "length", {
            /**
             *  Gets the number of nodes in this path.
             */
            get: function () {
                return this._path != null ? this._path.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Gets the node at the given index.
         */
        Path.prototype.at = function (idx) {
            return this._path[idx] || null;
        };
        /**
         *  Peek at the next element without adjusting the index.
         */
        Path.prototype.peek = function () {
            return this._path[this._idx + 1] || null;
        };
        /**
         *  Peek at the previous element without adjusting the index.
         */
        Path.prototype.peekBehind = function () {
            return this._path[this._idx - 1] || null;
        };
        /**
         *  Peeks at the last element in ths path.
         */
        Path.prototype.peekLast = function () {
            return this._path[this.length - 1] || null;
        };
        /**
         *  Gets whether or not there is another element in the path.
         */
        Path.prototype.hasNext = function () {
            return this._idx + 1 < this.length;
        };
        /**
         *  Gets whether or not there is an element behind us.
         */
        Path.prototype.hasPrev = function () {
            return this._idx - 1 >= 0;
        };
        /**
         *  Moves the index forward one step and returns the element at the index.
         */
        Path.prototype.next = function () {
            ++this._idx;
            if (this._idx > this.length) {
                this._idx = this.length;
            }
            return this._path[this._idx] || null;
        };
        /**
         *  Rolls the index back one step and returns the element at the index.
         */
        Path.prototype.prev = function () {
            --this._idx;
            if (this._idx < -1) {
                this._idx = -1;
            }
            return this._path[this._idx] || null;
        };
        return Path;
    })();
    KGAD.Path = Path;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
/// <reference path="../../definitions/astar.d.ts" />
var KGAD;
(function (KGAD) {
    var Pathfinding = (function () {
        function Pathfinding(map) {
            this.map = map;
            this.createGrid();
        }
        /**
         *  Attempts to find the shortest path from one point to another.
         */
        Pathfinding.prototype.findPath = function (from, to, fullSearch) {
            if (fullSearch === void 0) { fullSearch = false; }
            this.createGrid();
            var start = this.graph.grid[from.x][from.y];
            var end = this.graph.grid[to.x][to.y];
            if (!fullSearch) {
                var miniGrid = this.createMiniGrid(from, to);
                var path = astar.search(miniGrid, start, end);
            }
            if (fullSearch || path.length === 0) {
                path = astar.search(this.graph, start, end);
            }
            if (path.length === 0) {
                console.error('no path between ' + from.toString() + ' and ' + to.toString());
            }
            var result = [];
            for (var i = 0, l = path.length; i < l; ++i) {
                var node = path[i];
                result.push(new Phaser.Point(node.x, node.y));
            }
            return result;
        };
        Object.defineProperty(Pathfinding.prototype, "gridWidth", {
            /**
             *  Gets the width of the grid (in tiles).
             */
            get: function () {
                return this.map.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pathfinding.prototype, "gridHeight", {
            /**
             *  Gets the height of the grid (in tiles).
             */
            get: function () {
                return this.map.height;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Gets the pathfinding node at the given (x, y) coordinate.
         */
        Pathfinding.prototype.getNodeAt = function (x, y) {
            var idx = y * this.gridWidth + x;
            if (idx < 0 || idx >= this.size) {
                return null;
            }
            return this.graph.grid[x][y];
        };
        Pathfinding.prototype.createMiniGrid = function (from, to) {
            var minX = Math.min(from.x, to.x);
            var minY = Math.min(from.y, to.y);
            var maxX = Math.max(from.x, to.x);
            var maxY = Math.max(from.y, to.y);
            var rect = new Phaser.Rectangle(minX, minY, maxX - minX, maxY - minY);
            var width = rect.width;
            var height = rect.height;
            var size = width * height;
            var grid = [];
            for (var x = minX, j = 0; x < maxX; ++x, ++j) {
                grid[j] = [];
                for (var y = minY, k = 0; y < maxY; ++y, ++k) {
                    grid[j][k] = this.graph.grid[j][k].weight;
                }
            }
            return new Graph(grid, { diagonal: false });
        };
        /**
         *  Creates the internal representation of the grid.
         */
        Pathfinding.prototype.createGrid = function () {
            var width = this.gridWidth;
            var height = this.gridHeight;
            var size = width * height;
            var collisionTiles = this.map.collisionLayer.getTiles(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            var tilemap = this.map.tilemap;
            var collisionLayer = this.map.collisionLayer;
            this.size = size;
            var grid = [];
            for (var x = 0; x < width; ++x) {
                grid[x] = [];
                for (var y = 0; y < height; ++y) {
                    var weight = KGAD.OccupiedGrid.getWeightOfInTileCoordinates(x, y);
                    grid[x][y] = weight;
                }
            }
            this.graph = new Graph(grid, { diagonal: false });
        };
        /**
         *  Updates the grid with the latest wall/occupation information.
         */
        Pathfinding.prototype.updateGrid = function () {
            var w = this.gridWidth, h = this.gridHeight;
            for (var x = 0; x < w; ++x) {
                for (var y = 0; y < h; ++y) {
                    var weight = KGAD.OccupiedGrid.getWeightOfInTileCoordinates(x, y);
                    this.graph.grid[x][y].weight = weight;
                }
            }
        };
        Pathfinding.prototype.render = function () {
            //return;
            var game = KGAD.Game.Instance;
            /*for (var x = 0; x < this.gridWidth; ++x) {
                for (var y = 0; y < this.gridHeight; ++y) {
                    game.debug.text(this.graph.grid[x][y].x + "," + this.graph.grid[x][y].y, x * 32, y * 32 + 32, '#FFFFFF', '10px Courier New');
                    game.debug.text(this.graph.grid[x][y].weight.toString(), x * 32, y * 32 - 10, '#FFFFFF', '10px Courier New');
                }
            }*/
        };
        return Pathfinding;
    })();
    KGAD.Pathfinding = Pathfinding;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    /**
     *  Contains a set of static utility functions for arrays.
     */
    var Arrays = (function () {
        function Arrays() {
        }
        /**
         *  Shuffles an array in-place randomly.
         */
        Arrays.shuffle = function (arr) {
            var counter = arr.length, temp, index;
            while (counter > 0) {
                index = Math.floor(Math.random() * counter--);
                temp = arr[counter];
                arr[counter] = arr[index];
                arr[index] = temp;
            }
            return arr;
        };
        /**
         *  Removes an element from an array.
         */
        Arrays.remove = function (value, arr) {
            var idx = $.inArray(value, arr);
            if (idx >= 0) {
                return arr.splice(idx, 1)[0];
            }
            return null;
        };
        /**
         *  Removes multiple elements from an array.
         */
        Arrays.removeAll = function (values, arr) {
            var result = [];
            for (var i = 0, l = values.length; i < l; ++i) {
                var removed = Arrays.remove(values[i], arr);
                if (removed != null) {
                    result.push(removed);
                }
            }
            return result;
        };
        return Arrays;
    })();
    KGAD.Arrays = Arrays;
})(KGAD || (KGAD = {}));
//# sourceMappingURL=app.js.map