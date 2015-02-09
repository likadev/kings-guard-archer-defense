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
            ];
            var total = spritesheets.length;
            var itemsToLoad = total;
            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === 'hero_spritesheet';
                var callback = function (sprite) {
                    _this.sprites[sprite.key] = sprite;
                    --itemsToLoad;
                    if (itemsToLoad <= 0) {
                        _this.ready = true;
                    }
                };
                KGAD.AnimationLoader.load(name, callback, isHero ? KGAD.Hero : KGAD.AnimatedSprite);
            }
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
        }
        GameSimulationState.prototype.init = function (args) {
            this.map = args[0];
            this.sprites = args[1];
            this.hero = this.sprites['hero_spritesheet'];
            this.king = this.sprites['king'];
        };
        GameSimulationState.prototype.preload = function () {
        };
        GameSimulationState.prototype.create = function () {
            this.map.create();
            var heroPos = this.map.toPixels(this.map.heroSpawnPoint).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            var kingPos = this.map.toPixels(this.map.kingSpawnPoint).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            this.hero.position.set(heroPos.x, heroPos.y);
            this.king.position.set(kingPos.x, kingPos.y);
            for (var spriteKey in this.sprites) {
                if (this.sprites.hasOwnProperty(spriteKey)) {
                    var sprite = this.sprites[spriteKey];
                    if (typeof sprite.init === 'function') {
                        sprite.init();
                    }
                }
            }
        };
        GameSimulationState.prototype.update = function () {
            this.game.physics.arcade.collide(this.hero, this.map.collisionLayer);
            this.game.physics.arcade.collide(this.hero, this.king);
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
        }
        AnimatedSprite.prototype.init = function () {
            this.default_animation = KGAD.AnimationHelper.getCurrentAnimation(this);
            var animation = this.animations.getAnimation(this.default_animation);
            if (animation != null) {
                this.animations.play(this.default_animation);
            }
            this.game.physics.arcade.enable(this);
            this.game.physics.arcade.enableBody(this);
            this.game.world.add(this);
            this.body.collideWorldBounds = true;
            this.body.immovable = true;
        };
        AnimatedSprite.prototype.update = function () {
            _super.prototype.update.call(this);
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
        function Weapon(game, key, cooldown, projectileSpeed) {
            if (projectileSpeed === void 0) { projectileSpeed = 0; }
            this.game = game;
            this.key = key;
            this.cooldown = cooldown;
            this.projectileSpeed = projectileSpeed;
            this.lastFire = 0;
        }
        Weapon.prototype.preload = function () {
            if (!Weapon.projectileGroups.hasOwnProperty(this.key)) {
                var url = 'assets/textures/weapons/' + this.key + '.png';
                this.game.load.image(this.key, url);
            }
        };
        Weapon.prototype.create = function () {
            var group = Weapon.projectileGroups[this.key];
            if (!Weapon.projectileGroups.hasOwnProperty(this.key)) {
                group = this.game.add.group();
                Weapon.projectileGroups[this.key] = group;
            }
            this.group = group;
        };
        Weapon.prototype.fire = function (x, y, direction) {
            var _this = this;
            var now = this.game.time.now;
            if (this.canFire) {
                var sprite = this.group.create(x, y, this.key);
                sprite.anchor.setTo(0.5);
                sprite.rotation = Phaser.Point.angle(direction, new Phaser.Point());
                this.game.physics.arcade.enable(sprite);
                this.game.physics.arcade.enableBody(sprite);
                this.game.physics.arcade.velocityFromAngle(sprite.angle, this.projectileSpeed, sprite.body.velocity);
                setTimeout(function () {
                    if (sprite.alive) {
                        _this.game.add.tween(sprite).to({ alpha: 0 }, 250).start().onComplete.addOnce(function () {
                            sprite.kill();
                            Weapon.activeProjectiles = Weapon.activeProjectiles.splice(Weapon.activeProjectiles.indexOf(sprite), 1);
                        });
                    }
                }, 5000);
                Weapon.activeProjectiles.push(sprite);
                this.lastFire = now;
                return true;
            }
            return false;
        };
        Object.defineProperty(Weapon.prototype, "canFire", {
            get: function () {
                return this.game.time.now - this.lastFire > this.cooldown;
            },
            enumerable: true,
            configurable: true
        });
        Weapon.prototype.update = function () {
            this.game.physics.arcade.collide(this.group, KGAD.Game.CurrentMap.collisionLayer);
        };
        Weapon.projectileGroups = {};
        Weapon.activeProjectiles = [];
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
    var Hero = (function (_super) {
        __extends(Hero, _super);
        function Hero(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            this.keys = {};
            this.canMove = true;
            this.moveTowards = null;
            var keyboard = game.input.keyboard;
            this.keys[0 /* Up */] = [keyboard.addKey(Phaser.Keyboard.UP), keyboard.addKey(Phaser.Keyboard.W)];
            this.keys[1 /* Left */] = [keyboard.addKey(Phaser.Keyboard.LEFT), keyboard.addKey(Phaser.Keyboard.A)];
            this.keys[2 /* Down */] = [keyboard.addKey(Phaser.Keyboard.DOWN), keyboard.addKey(Phaser.Keyboard.S)];
            this.keys[3 /* Right */] = [keyboard.addKey(Phaser.Keyboard.RIGHT), keyboard.addKey(Phaser.Keyboard.D)];
            this.fireKey = [keyboard.addKey(Phaser.Keyboard.Z), keyboard.addKey(Phaser.Keyboard.SPACEBAR)];
            this.weapon = new KGAD.Weapon(game, 'basic_arrow', 250, 750);
            this.weapon.preload();
        }
        Hero.prototype.init = function () {
            var _this = this;
            _super.prototype.init.call(this);
            this.body.immovable = false;
            var cancelMovementCallback = function () {
                _this.cancelMovement();
            };
            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    var keys = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];
                        var dir = parseInt(direction, 10);
                        switch (dir) {
                            case 0 /* Up */:
                                key.onDown.add(function () {
                                    _this.moveUp();
                                });
                                break;
                            case 1 /* Left */:
                                key.onDown.add(function () {
                                    _this.moveLeft();
                                });
                                break;
                            case 2 /* Down */:
                                key.onDown.add(function () {
                                    _this.moveDown();
                                });
                                break;
                            case 3 /* Right */:
                                key.onDown.add(function () {
                                    _this.moveRight();
                                });
                                break;
                        }
                        key.onUp.add(cancelMovementCallback);
                    }
                }
            }
            this.fireKey.forEach(function (value) {
                value.onDown.add(function () {
                    _this.fire();
                });
            });
            this.weapon.create();
        };
        Hero.prototype.fire = function () {
            this.weapon.fire(this.x, this.y, KGAD.MovementHelper.getPointFromDirection(this.direction));
        };
        Hero.prototype.handleMovement = function (direction) {
            this.moveTowards = direction;
            if (!this.canMove) {
                return;
            }
            this.direction = direction;
            this.action = KGAD.Actions.Moving;
            this.nextAnimation = KGAD.AnimationHelper.getCurrentAnimation(this);
            if (!KGAD.MovementHelper.move(this, direction)) {
                this.action = KGAD.Actions.Standing;
                this.nextAnimation = KGAD.AnimationHelper.getCurrentAnimation(this);
            }
            this.play(this.nextAnimation);
        };
        Hero.prototype.moveUp = function () {
            this.handleMovement(0 /* Up */);
        };
        Hero.prototype.moveLeft = function () {
            this.handleMovement(1 /* Left */);
        };
        Hero.prototype.moveDown = function () {
            this.handleMovement(2 /* Down */);
        };
        Hero.prototype.moveRight = function () {
            this.handleMovement(3 /* Right */);
        };
        Hero.prototype.cancelMovement = function () {
            for (var dir in this.keys) {
                if (this.keys.hasOwnProperty(dir)) {
                    var keys = this.keys[dir];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        if (keys[i].isDown) {
                            this.moveTowards = dir;
                            return;
                        }
                    }
                }
            }
            this.moveTowards = null;
            this.body.velocity.setTo(0, 0);
        };
        Hero.prototype.update = function () {
            _super.prototype.update.call(this);
            this.weapon.update();
        };
        return Hero;
    })(KGAD.AnimatedSprite);
    KGAD.Hero = Hero;
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
            game.physics.arcade.moveToXY(sprite, dest.x, dest.y, speed, maxTime);
            return true;
        };
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
        AnimationLoader.load = function (name, callback, typ) {
            var spritesUrl = 'assets/textures/characters/' + name + '.sprites';
            var animUrl = 'assets/textures/characters/' + name + '.anim';
            ++AnimationLoader.animationDataParsed;
            var spriteLoader = AnimationLoader.loadItem(spritesUrl);
            var animLoader = AnimationLoader.loadItem(animUrl);
            $.when(spriteLoader, animLoader).done(function (spriteXml, animXml) {
                try {
                    return AnimationLoader.parseXml(name, spriteXml, animXml, callback, typ);
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
        AnimationLoader.parseXml = function (name, spriteXml, animXml, callback, typ) {
            var game = KGAD.Game.Instance;
            var image = null;
            $(spriteXml).find('img').each(function (idx, e) {
                var imgName = $(this).attr('name');
                var url = 'assets/textures/characters/' + imgName;
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
    var GameMap = (function () {
        function GameMap(mapName) {
            this.game = KGAD.Game.Instance;
            this.mapName = mapName;
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
        /**
         *  Converts a tile numeric value to pixels.
         */
        GameMap.prototype.toPixels = function (x) {
            if (typeof x === 'number') {
                return x * GameMap.TILE_WIDTH;
            }
            else {
                return x.multiply(GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT);
            }
        };
        /**
         *  Converts a number or point to tile coordinates.
         */
        GameMap.prototype.fromPixels = function (num) {
            if (typeof num === 'number') {
                return num / GameMap.TILE_WIDTH;
            }
            else {
                return new Phaser.Point(num.x / GameMap.TILE_WIDTH, num.y / GameMap.TILE_HEIGHT);
            }
        };
        /**
         *  Preloads assets. Should be called during the 'preload' Phaser phase.
         */
        GameMap.prototype.preload = function () {
            var url = "assets/maps/" + this.mapName + ".json";
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
        };
        /**
         *  Loads JSON file from the URL built from the map name.
         */
        GameMap.prototype.loadJsonData = function () {
            var _this = this;
            this.loaded = false;
            var filename = "assets/maps/" + this.mapName + ".json";
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
//# sourceMappingURL=app.js.map