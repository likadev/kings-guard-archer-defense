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
                'hero_spritesheet',
                'king',
                'enemy',
            ];
            var total = spritesheets.length;
            var itemsToLoad = total;
            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === 'hero_spritesheet';
                var isEnemy = name === 'enemy';
                var isKing = name === 'king';
                var callback = function (sprite) {
                    _this.sprites[sprite.key] = sprite;
                    --itemsToLoad;
                    if (itemsToLoad <= 0) {
                        _this.ready = true;
                    }
                };
                KGAD.AnimationLoader.load(name, callback, isHero ? KGAD.Hero : isEnemy ? KGAD.Enemy : isKing ? KGAD.King : KGAD.AnimatedSprite);
            }
            KGAD.AnimationLoader.load('charge', function (s) {
                _this.chargeSprite = s;
            }, KGAD.AnimatedSprite, 'assets/textures/weapons/');
        };
        PreGameLoadingState.prototype.create = function () {
            this.enemyGenerator = new KGAD.EnemyGenerator();
            this.enemyGenerator.addType(new KGAD.EnemySpecification("enemy", 64, 3, 0));
        };
        PreGameLoadingState.prototype.update = function () {
            var states = KGAD.States.Instance;
            if (KGAD.AnimationLoader.done && this.ready) {
                var hero = this.sprites['hero_spritesheet'];
                hero.weapon.chargeSprite = this.chargeSprite;
                states.switchTo(KGAD.States.GameSimulation, true, false, this.map, this.sprites, this.enemyGenerator);
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
        }
        GameSimulationState.prototype.init = function (args) {
            this.map = args[0];
            this.sprites = args[1];
            this.enemyGenerator = args[2];
            this.hero = this.sprites['hero_spritesheet'];
            this.king = this.sprites['king'];
        };
        GameSimulationState.prototype.preload = function () {
            this.hero.weapon.preload();
            KGAD.GameInfo.create(this.king, this.hero);
            KGAD.GameInfo.CurrentGame.enemies = this.enemyGenerator;
        };
        GameSimulationState.prototype.create = function () {
            var _this = this;
            this.map.create();
            var heroPos = this.map.toPixels(this.map.heroSpawnPoint).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            var kingPos = this.map.toPixels(this.map.kingSpawnPoint).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            this.hero.position.set(heroPos.x, heroPos.y);
            this.king.position.set(kingPos.x, kingPos.y);
            for (var spriteKey in this.sprites) {
                if (this.sprites.hasOwnProperty(spriteKey)) {
                    var sprite = this.sprites[spriteKey];
                    if (sprite instanceof KGAD.Enemy) {
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
                enemySpawns[i] = this.map.toPixels(enemySpawns[i]).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            }
            this.enemyGenerator.create('enemy', enemySpawns[0].x, enemySpawns[0].y);
            this.enemyGenerator.create('enemy', enemySpawns[1].x, enemySpawns[1].y);
            var spawnEnemy = null;
            spawnEnemy = function () {
                var idx = _this.game.rnd.integerInRange(0, enemySpawns.length - 1);
                var nextSpawnTime = 3000;
                if (_this.enemyGenerator.enemies.length <= 2) {
                    nextSpawnTime = 500;
                }
                _this.enemyGenerator.create('enemy', enemySpawns[idx].x, enemySpawns[idx].y);
                _this.game.time.events.add(nextSpawnTime, spawnEnemy, _this);
            };
            this.game.time.events.add(5000, spawnEnemy, this);
        };
        GameSimulationState.prototype.update = function () {
            var _this = this;
            var info = KGAD.GameInfo.CurrentGame;
            var projectiles = info.projectiles;
            projectiles.update();
            var physics = this.game.physics.arcade;
            physics.collide(this.hero, [this.king, this.map.collisionLayer]);
            physics.collide(this.hero, this.enemyGenerator.enemies);
            physics.collide(projectiles.getActiveProjectiles(), this.enemyGenerator.enemies, function (first, second) {
                _this.handleProjectileCollision(first, second);
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
                this.game.state.start(KGAD.States.Boot, true, false);
            }
        };
        GameSimulationState.prototype.render = function () {
            return;
            var enemies = this.enemyGenerator.enemies;
            for (var i = 0, l = enemies.length; i < l; ++i) {
                enemies[i].render();
            }
            this.hero.render();
            this.map.debugRenderOccupiedGrid();
            this.map.pathfinder.render();
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
            get: function () {
                return Game.instance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "CurrentMap", {
            get: function () {
                return Game.currentMap;
            },
            set: function (map) {
                this.currentMap = map;
            },
            enumerable: true,
            configurable: true
        });
        Game.instance = null;
        Game.currentMap = null;
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
            this.anchor.setTo(0.5);
            this.action = KGAD.Actions.Standing;
            this.direction = 2 /* Down */;
            this.added = false;
            this.canOccupy = true;
            this.blocked = false;
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
                return 2;
            },
            enumerable: true,
            configurable: true
        });
        AnimatedSprite.prototype.addToWorld = function () {
            if (!this.added) {
                this.default_animation = KGAD.AnimationHelper.getCurrentAnimation(this);
                var animation = this.animations.getAnimation(this.default_animation);
                if (animation != null) {
                    this.animations.play(this.default_animation);
                }
                this.game.world.add(this);
                this.added = true;
            }
            this.lastPosition = this.position;
            this.tilePosition = new Phaser.Point(Math.floor(this.x / KGAD.GameMap.TILE_WIDTH), Math.floor(this.y / KGAD.GameMap.TILE_HEIGHT));
            this.lastTilePosition = this.tilePosition;
            this.map.occupy(this.tilePosition.x, this.tilePosition.y, this);
        };
        AnimatedSprite.prototype.face = function (sprite) {
            var angle = this.game.physics.arcade.angleBetween(this.position, sprite.position);
            this.direction = KGAD.MovementHelper.getDirectionFromAngle(angle);
        };
        AnimatedSprite.prototype.updateAnimation = function (onComplete) {
            var animationName = KGAD.AnimationHelper.getCurrentAnimation(this);
            if (animationName != null) {
                if (animationName === this.animations.currentAnim.name) {
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
            return this;
        };
        AnimatedSprite.prototype.preUpdate = function () {
            _super.prototype.preUpdate.call(this);
        };
        AnimatedSprite.prototype.update = function () {
            _super.prototype.update.call(this);
            var map = KGAD.Game.CurrentMap;
            this.tilePosition = map.fromPixels(this.position);
            if (this.canOccupyTiles) {
                var map = KGAD.Game.CurrentMap;
                if (!this.tilePosition.equals(this.lastTilePosition)) {
                    if (!map.occupy(this.tilePosition.x, this.tilePosition.y, this)) {
                        this.position = this.lastPosition;
                        /*if (this.body) {
                            this.body.velocity.setTo(0);
                        }*/
                        this.blocked = true;
                    }
                    else {
                        this.lastPosition = this.position;
                        this.lastTilePosition = this.tilePosition;
                        this.blocked = false;
                    }
                }
            }
        };
        AnimatedSprite.prototype.render = function () {
        };
        return AnimatedSprite;
    })(Phaser.Sprite);
    KGAD.AnimatedSprite = AnimatedSprite;
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
            this.game.physics.arcade.collide(this.group, KGAD.Game.CurrentMap.collisionLayer);
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
            this.attached = [];
            this.speed = 75;
            this.tilePosition = null;
            this.lastTilePosition = null;
            this.rerouting = false;
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
            _super.prototype.addToWorld.call(this);
        };
        Object.defineProperty(Enemy.prototype, "weight", {
            get: function () {
                if (this.rerouting) {
                    return 0;
                }
                if (this.action == KGAD.Actions.Firing) {
                    return 50;
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
                KGAD.Game.CurrentMap.unoccupy(this);
                if (this.currentTween != null && this.currentTween.isRunning) {
                    this.currentTween.stop(false);
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
            if (this.currentTarget == null) {
                this.currentTarget = this.threatTable.getHighestThreatTarget();
                if (this.currentTarget == null) {
                    this.debugStateName = 'no_target';
                    return;
                }
            }
            if (this.weapon.isBackSwinging()) {
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
            if (this.currentPath != null) {
                for (var i = 0, l = this.currentPath.length; i < l; ++i) {
                    var node = KGAD.Game.CurrentMap.toPixels(this.currentPath[i]);
                    this.game.debug.geom(new Phaser.Rectangle(node.x, node.y, 32, 32), "#FF0000", false);
                }
            }
            if (this.currentDestination != null) {
                this.game.debug.geom(new Phaser.Rectangle(this.currentDestination.x - 16, this.currentDestination.y - 16, 32, 32), '#00FF00', false);
            }
            this.game.debug.text(this.debugStateName, this.x - 16, this.y - 16, '#FFFFFF', '12px Courier new');
            //this.game.debug.geom(new Phaser.Rectangle(this.tilePosition.x * 32, this.tilePosition.y * 32, 32, 32));
            if (this.currentTarget != null) {
            }
        };
        /**
         *  Move towards a target.
         */
        Enemy.prototype.seekTarget = function () {
            this.action = KGAD.Actions.Moving;
            var info = KGAD.GameInfo.CurrentGame;
            var map = KGAD.Game.CurrentMap;
            var targetPosition = this.currentTarget.position;
            var targetPositionTiles = this.currentTarget.tilePosition;
            if (this.currentPath != null && this.currentPath.length > 0) {
                var enemyTile = this.currentPath[this.currentPath.length - 1];
                if (!targetPositionTiles.equals(enemyTile)) {
                    this.currentPath = null;
                }
            }
            var inDirectSight = this.inDirectSightOf(this.currentTarget);
            if (!inDirectSight) {
                this.body.velocity.setTo(0);
            }
            if (inDirectSight) {
                // We're in direct sight of the target, so charge at them.
                if (this.currentTween != null && this.currentTween.isRunning) {
                    this.currentTween.stop(false);
                    this.currentTween = null;
                }
                this.moving = false;
                this.rerouting = false;
                this.game.physics.arcade.moveToObject(this, this.currentTarget, this.speed);
                this.currentPath = null;
                this.currentDestination = null;
                this.direction = KGAD.MovementHelper.getDirectionFromAngle(this.game.physics.arcade.angleBetween(this.position, this.currentTarget.position));
                this.updateAnimation();
                this.tilePosition = map.fromPixels(this.position);
                if (!map.occupy(this.tilePosition.x, this.tilePosition.y, this)) {
                    this.debugStateName = 'busy';
                    this.body.velocity.setTo(0);
                    inDirectSight = false;
                }
                else {
                    this.debugStateName = 'direct';
                }
            }
            if (!inDirectSight && (this.currentPath == null || this.currentPath.length === 0)) {
                // Find a path to the target.
                this.currentPath = map.findPath(this.tilePosition, targetPositionTiles);
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
            this.currentPath = null;
            this.currentDestination = null;
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
         *  Checks if the target is in direct sight of us.
         */
        Enemy.prototype.inDirectSightOf = function (sprite) {
            var halfX = (this.x - KGAD.GameMap.TILE_WIDTH / 2) + 1;
            var halfY = (this.y - KGAD.GameMap.TILE_HEIGHT / 2) + 1;
            var tX = (sprite.x - KGAD.GameMap.TILE_WIDTH / 2) + 1;
            var tY = (sprite.y - KGAD.GameMap.TILE_HEIGHT / 2) + 1;
            var tW = sprite.width - 2;
            var tH = sprite.height - 2;
            var lines = [];
            lines[0] = new Phaser.Line(halfX, halfY, tX, tY);
            lines[1] = new Phaser.Line(halfX + this.width - 2, halfY, tX + tW, tY);
            lines[2] = new Phaser.Line(halfX + this.width - 2, halfY + this.height - 2, tX + tW, tY + tH);
            lines[3] = new Phaser.Line(halfX, halfY + this.height - 2, tX, tY + tH);
            lines[4] = new Phaser.Line(this.x, this.y, sprite.x, sprite.y);
            var hits = KGAD.CollisionHelper.raycast(lines);
            if (hits.length > 0) {
                return false;
            }
            var sprites = KGAD.CollisionHelper.raycastForSprites(lines[4], 4, this);
            for (var i = 0, l = sprites.length; i < l; ++i) {
                var obstacle = sprites[i];
                if (obstacle === sprite || obstacle === this) {
                    continue;
                }
                return false;
            }
            return true;
        };
        /**
         *  Handles moving from one tile to the next.
         */
        Enemy.prototype.moveToNextDestination = function () {
            var _this = this;
            if (this.moving || (this.currentTween != null && this.currentTween.isRunning)) {
                this.debugStateName = 'moving_path_now';
                return;
            }
            var nextTile = null;
            if (this.currentDestination == null && this.currentPath != null && this.currentPath.length > 0) {
                nextTile = this.currentPath[0];
                this.currentDestination = KGAD.Game.CurrentMap.toPixels(nextTile);
                this.currentDestination.add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            }
            if (nextTile == null) {
                this.currentDestination = null;
                return;
            }
            if (this.tilePosition.equals(nextTile)) {
                this.currentPath.splice(0, 1);
                this.currentDestination = null;
                return;
            }
            var angle = this.game.physics.arcade.angleBetween(this.tilePosition, nextTile);
            var direction = KGAD.MovementHelper.getDirectionFromAngle(angle);
            var change = this.direction != direction;
            this.direction = direction;
            var map = KGAD.Game.CurrentMap;
            if (!map.occupy(nextTile.x, nextTile.y, this)) {
                var occupant = map.getOccupantOf(nextTile.x, nextTile.y);
                if (occupant instanceof KGAD.Hero) {
                    this.currentPath = null;
                    this.currentDestination = null;
                    this.currentTarget = occupant;
                    return;
                }
                this.action = KGAD.Actions.Standing;
                if (change) {
                    this.updateAnimation();
                }
                if (this.recheckPathStartTime > 0) {
                    this.debugStateName = 'waiting';
                    this.recheckPathTime = this.game.time.now - this.recheckPathStartTime;
                    if (this.recheckPathTime > 100) {
                        this.debugStateName = 'rerouting';
                        this.currentPath = null;
                        this.currentDestination = null;
                        this.rerouting = true;
                    }
                }
                else {
                    this.debugStateName = 'waiting';
                    this.recheckPathStartTime = this.game.time.now;
                }
                return;
            }
            this.rerouting = false;
            this.debugStateName = 'moving_path';
            this.recheckPathStartTime = 0;
            this.lastTilePosition = this.tilePosition = nextTile;
            this.currentPath.splice(0, 1);
            this.action = KGAD.Actions.Moving;
            this.moving = true;
            var timeToMove = Phaser.Point.distance(this.position, this.currentDestination) / this.speed * 1000;
            this.currentTween = this.game.add.tween(this).to({ x: this.currentDestination.x, y: this.currentDestination.y }, timeToMove, Phaser.Easing.Linear.None, true, 0);
            this.currentTween.onComplete.addOnce(function () {
                _this.moving = false;
                _this.currentDestination = null;
            });
            this.updateAnimation();
        };
        return Enemy;
    })(KGAD.AnimatedSprite);
    KGAD.Enemy = Enemy;
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
/// <reference path="../sprites/conversion/EnemySpecification.ts" />
var KGAD;
(function (KGAD) {
    var EnemyGenerator = (function () {
        function EnemyGenerator(types) {
            if (types === void 0) { types = []; }
            this.enemies = [];
            this.enemyTypes = types;
            this.groups = {};
        }
        EnemyGenerator.prototype.addType = function (enemy) {
            if (this.enemyTypes.indexOf(enemy) < 0) {
                this.enemyTypes.push(enemy);
                this.createGroup(enemy);
            }
        };
        EnemyGenerator.prototype.create = function (enemy, x, y) {
            var enemyType = null;
            if (typeof enemy === 'string') {
                for (var i = 0, l = this.enemyTypes.length; i < l; ++i) {
                    var enemyTyp = this.enemyTypes[i];
                    if (enemyTyp.key === enemy) {
                        enemyType = enemyTyp;
                        break;
                    }
                }
            }
            else if (enemy instanceof KGAD.EnemySpecification) {
                enemyType = enemy;
            }
            else {
                throw new Error("Unknown parameter: " + enemy);
            }
            var game = KGAD.Game.Instance;
            var group = this.groups[enemyType.key];
            //var sprite: Enemy = group.create(x, y, enemyType.key);
            var sprite = new KGAD.Enemy(game, x, y, enemyType.key);
            KGAD.AnimationLoader.addAnimationToSprite(sprite, enemyType.key);
            var king = KGAD.GameInfo.CurrentGame.king;
            var angle = game.physics.arcade.angleBetween(king, sprite);
            sprite.init(enemyType);
            sprite.addToWorld();
            sprite.direction = KGAD.MovementHelper.getDirectionFromAngle(angle);
            sprite.updateAnimation();
            this.enemies.push(sprite);
            return sprite;
        };
        /**
         *  Creates a Phaser group, which will generate the sprites.
         */
        EnemyGenerator.prototype.createGroup = function (enemy) {
            var game = KGAD.Game.Instance;
            var group = game.add.group(null, 'enemy_' + enemy.key);
            group.enableBody = true;
            group.physicsBodyType = Phaser.Physics.ARCADE;
            group.classType = KGAD.Enemy;
            this.groups[enemy.key] = group;
        };
        /**
         *  Remove an enemy from the list of enemies.
         */
        EnemyGenerator.prototype.killEnemy = function (enemy) {
            var removedEnemy = null;
            var index = this.enemies.indexOf(enemy);
            if (index >= 0) {
                removedEnemy = this.enemies.splice(index, 1)[0];
            }
            return removedEnemy;
        };
        EnemyGenerator.prototype.update = function () {
            var enemiesToRemove = [];
            for (var i = 0, l = this.enemies.length; i < l; ++i) {
                var enemy = this.enemies[i];
                if (!enemy.alive || !enemy.exists) {
                    enemiesToRemove.push(enemy);
                }
                enemy.update();
            }
            for (i = 0, l = enemiesToRemove.length; i < l; ++i) {
                this.killEnemy(enemiesToRemove[i]);
            }
            var game = KGAD.Game.Instance;
            game.physics.arcade.collide(this.enemies, this.enemies);
            for (var key in this.groups) {
                if (this.groups.hasOwnProperty(key)) {
                    var group = this.groups[key];
                    game.physics.arcade.collide(group, group);
                }
            }
        };
        return EnemyGenerator;
    })();
    KGAD.EnemyGenerator = EnemyGenerator;
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
            _super.prototype.init.call(this);
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
            var projectiles = KGAD.GameInfo.CurrentGame.projectiles;
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
                    this.chargeDirection = this.direction;
                    this.lastChargingState = this.weapon.isCharging();
                    this.updateMovementState();
                }
            }
            this.weapon.update(this);
        };
        Hero.prototype.render = function () {
            _super.prototype.render.call(this);
        };
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
            this.health = 20;
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
    var GameInfo = (function () {
        function GameInfo(king, hero) {
            this.king = king;
            this.hero = hero;
            this.projectiles = new KGAD.ProjectileManager();
        }
        Object.defineProperty(GameInfo, "CurrentGame", {
            get: function () {
                return this.instance;
            },
            set: function (info) {
                this.instance = info;
            },
            enumerable: true,
            configurable: true
        });
        GameInfo.create = function (king, hero) {
            GameInfo.CurrentGame = new GameInfo(king, hero);
        };
        return GameInfo;
    })();
    KGAD.GameInfo = GameInfo;
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
            var info = KGAD.GameInfo.CurrentGame;
            this.addThreat(info.king, 1);
            this.addThreat(info.hero, 1);
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
                threatData.threat += threat;
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
         *
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
                    var activator = new AniamtedSpriteActivator(typ);
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
        AnimationLoader.addAnimationToSprite = function (sprite, animationData) {
            var rate = 0;
            if (typeof animationData === 'string') {
                animationData = KGAD.Game.Instance.cache.getJSON(animationData);
                for (var j = 0, len = animationData.length; j < len; ++j) {
                    var animation = animationData[j];
                    rate = 1000 / (30 - (30 * (1 - animation.frameRate)));
                    sprite.animations.add(animation.name, animation.frames, rate, animation.loops);
                }
            }
            else {
                rate = 1000 / (30 - (30 * (1 - animationData.frameRate)));
                sprite.animations.add(animationData.name, animationData.frames, rate, animationData.loops);
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
            var info = KGAD.GameInfo.CurrentGame;
            var enemies = info.enemies.enemies;
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
            var info = KGAD.GameInfo.CurrentGame;
            var enemies = info.enemies.enemies;
            var coords;
            var spriteHits;
            var _line;
            if (line instanceof Array) {
                for (var i = 0, l = line.length; i < l; ++i) {
                    _line: Phaser.Line = line[i];
                    coords = _line.coordinatesOnLine(stepRate, coords);
                    spriteHits = [];
                    for (var k = 0, n = coords.length; k < n; ++k) {
                        var coord = coords[k];
                        var tileCoord = map.fromPixels(coord);
                        var occupant = map.getOccupantOf(tileCoord.x, tileCoord.y);
                        if (occupant != null) {
                            if (requestor != null && occupant == requestor) {
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
                var undef;
                coords = _line.coordinatesOnLine(stepRate, undef);
                spriteHits = [];
                for (var k = 0, n = coords.length; k < n; ++k) {
                    var coord = coords[k];
                    var tileCoord = map.fromPixels(new Phaser.Point(coord[0], coord[1]));
                    var occupant = map.getOccupantOf(tileCoord.x, tileCoord.y);
                    if (occupant != null) {
                        spriteHits.push(occupant);
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
    var GameMap = (function () {
        function GameMap(mapName) {
            this.game = KGAD.Game.Instance;
            this.mapName = mapName;
            this.enemySpawns = [];
            this.occupiedGrid = [];
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
            this.pathfinder = new KGAD.Pathfinding(this);
            this.occupiedGrid = [];
            var size = this.width * this.height;
            for (i = 0; i < size; ++i) {
                this.occupiedGrid[i] = null;
            }
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
         *  Checks who the occupant of the given tile coordinate is.
         */
        GameMap.prototype.getOccupantOf = function (x, y) {
            if (this.isOutOfBounds(x, y) || this.isWall(x, y) || !this.isOccupied(x, y)) {
                return null;
            }
            var occupant = this.occupiedGrid[y * this.width + x];
            return occupant;
        };
        /**
         *  Occupy a tile for yourself.
         */
        GameMap.prototype.occupy = function (x, y, sprite) {
            if (this.isOutOfBounds(x, y) || this.isOccupied(x, y, sprite) || this.isWall(x, y)) {
                return false;
            }
            this.unoccupy(sprite);
            this.occupiedGrid[y * this.width + x] = sprite;
            var tile = this.tilemap.getTile(x, y, this.collisionLayer, true);
            if (tile != null) {
                tile.canCollide = true;
            }
            return true;
        };
        /**
         *  Un-occupy a spot on the map.
         */
        GameMap.prototype.unoccupy = function (x, y) {
            if (typeof x === 'number') {
                if (!this.isOutOfBounds(x, y)) {
                    this.occupiedGrid[y * this.width + x] = null;
                    var tile = this.tilemap.getTile(x, y, this.collisionLayer, true);
                    if (tile != null) {
                        tile.canCollide = false;
                    }
                }
            }
            else {
                var idx = -1;
                while (true) {
                    idx = this.occupiedGrid.indexOf(x);
                    if (idx >= 0) {
                        var sprite = this.occupiedGrid[idx];
                        this.occupiedGrid[idx] = null;
                        var tile = this.tilemap.getTile(Math.floor(sprite.x / GameMap.TILE_WIDTH), Math.floor(sprite.y / GameMap.TILE_HEIGHT), this.collisionLayer, true);
                        if (tile != null) {
                            tile.canCollide = false;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        };
        /**
         *  Checks if the given tile is occupied.
         */
        GameMap.prototype.isOccupied = function (x, y, requestor) {
            if (this.isOutOfBounds(x, y)) {
                return false;
            }
            var idx = y * this.width + x;
            var sprite = this.occupiedGrid[idx];
            if (sprite == null) {
                return false;
            }
            if (sprite === requestor) {
                return false;
            }
            if (!sprite.alive || !sprite.exists) {
                this.occupiedGrid[idx] = null;
                return false;
            }
            return true;
        };
        GameMap.prototype.getWeightOfOccupiedTile = function (x, y) {
            if (this.isWall(x, y) || this.isOutOfBounds(x, y)) {
                return 0;
            }
            if (!this.isOccupied(x, y)) {
                return 1;
            }
            var sprite = this.occupiedGrid[y * this.width + x];
            if (sprite != null) {
                return sprite.weight;
            }
            return 1;
        };
        GameMap.prototype.debugRenderOccupiedGrid = function () {
            for (var y = 0; y < this.height; ++y) {
                for (var x = 0; x < this.width; ++x) {
                    var sprite = this.occupiedGrid[y * this.width + x];
                    if (sprite != null) {
                        var rect = new Phaser.Rectangle(x * GameMap.TILE_WIDTH, y * GameMap.TILE_HEIGHT, GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT);
                        this.game.debug.geom(rect, '#0000FF', false);
                    }
                }
            }
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
                console.log(data);
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
            this.game.physics.arcade.setBoundsToWorld();
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
            var minX = Math.min(from.x, to.x) - 1;
            var minY = Math.min(from.y, to.y) - 1;
            var maxX = Math.max(from.x, to.x) + 1;
            var maxY = Math.max(from.y, to.y) + 1;
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
                    var isOccupied = this.map.isOccupied(x, y);
                    var isWall = this.map.isWall(x, y);
                    var weight = isWall ? 0 : (isOccupied ? this.map.getWeightOfOccupiedTile(x, y) : 1);
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
                    var isOccupied = this.map.isOccupied(x, y);
                    var isWall = this.map.isWall(x, y);
                    var weight = isWall ? 0 : (isOccupied ? this.map.getWeightOfOccupiedTile(x, y) : 1);
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
//# sourceMappingURL=app.js.map