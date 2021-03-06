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
            this.add.plugin(Phaser.Plugin.Tiled);
        };
        BootState.prototype.preload = function () {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 640;
            this.scale.minHeight = 640;
            this.scale.maxWidth = 1024;
            this.scale.maxHeight = 1024;
            this.scale.setScreenSize();
        };
        BootState.prototype.create = function () {
            this.input.maxPointers = 1;
            this.input.gamepad.start();
            this.game.physics.enable(Phaser.Physics.ARCADE);
            this.stage.disableVisibilityChange = true;
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
            this.buttonIndex = 0;
        }
        MainMenuState.prototype.init = function (args) {
            this.map = null;
            this.script = null;
            this.skillChallenge = false;
            this.buttonIndex = 0;
        };
        MainMenuState.prototype.preload = function () {
            this.game.load.json('mercenaries', 'assets/data/mercenaries.json');
            this.game.load.spritesheet('play_button', 'assets/textures/misc/play_button.png', 128, 64, 3);
            this.game.load.spritesheet('skill_challenge_button', 'assets/textures/misc/skill_challenge_button.png', 128, 64, 3);
            this.script = new KGAD.ScriptEngine();
            this.script.preload();
        };
        MainMenuState.prototype.create = function () {
            var _this = this;
            this.centerX = this.centerX || this.game.world.centerX;
            this.centerY = this.centerY || this.game.world.centerY;
            this.containerWidth = this.containerWidth || this.game.world.width;
            this.containerHeight = this.containerHeight || this.game.world.height;
            var header = KGAD.Text.createText("King's Guard: Archer Defense", {
                centeredX: true,
                style: {
                    font: "32px MedievalSharpBook",
                    align: "center"
                },
                addToWorld: true,
                fixedToCamera: true
            });
            KGAD.Text.createText("(Pre-alpha)", {
                centeredX: true,
                y: header.height + 2,
                style: {
                    font: "24px MedievalSharpBook",
                    fill: "#AAAAAA",
                    align: "center"
                },
                addToWorld: true,
                fixedToCamera: true
            });
            var footerHeight = KGAD.Text.measureText("Tip: Hold down the 'fire' button to charge your weapon.", 16).height;
            KGAD.Text.createText("Tip: Hold down the 'fire' button to charge your weapon.", {
                style: {
                    font: "16px MedievalSharpBook",
                    align: "center"
                },
                centeredX: true,
                y: this.containerHeight - footerHeight * 2,
                addToWorld: true,
                fixedToCamera: true
            });
            KGAD.Text.createText("(Z, Y, Space, or XBox 360 'A' button)", {
                style: {
                    font: "16px MedievalSharpBook",
                    fill: "#AAAAAA",
                    align: "center"
                },
                y: this.containerHeight - footerHeight,
                centeredX: true,
                addToWorld: true,
                fixedToCamera: true,
            });
            var buttonWidth = 128;
            var buttonHeight = 64;
            var spacing = 16;
            var playButtonPosition = {
                x: this.centerX - (buttonWidth / 2),
                y: this.centerY - (buttonHeight / 2) - buttonHeight
            };
            var skillChallengeButton = {
                x: this.centerX - (buttonWidth / 2),
                y: this.centerY - (buttonHeight / 2) + spacing
            };
            this.playButton = this.game.add.button(playButtonPosition.x, playButtonPosition.y, 'play_button');
            this.skillChallengeButton = this.game.add.button(skillChallengeButton.x, skillChallengeButton.y, 'skill_challenge_button');
            this.playButton.onInputOver.add(this.hover, this);
            this.playButton.onInputOut.add(this.blur, this);
            this.playButton.onInputDown.add(this.down, this);
            this.playButton.onInputUp.add(this.up, this);
            this.skillChallengeButton.onInputOver.add(this.hover, this);
            this.skillChallengeButton.onInputOut.add(this.blur, this);
            this.skillChallengeButton.onInputDown.add(this.down, this);
            this.skillChallengeButton.onInputUp.add(this.up, this);
            this.game.input.gamepad.start();
            this.cursors = this.game.input.keyboard.createCursorKeys();
            var okKeys = [
                this.game.input.keyboard.addKey(Phaser.Keyboard.Z),
                this.game.input.keyboard.addKey(Phaser.Keyboard.Y),
                this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
                this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER),
            ];
            for (var i = 0, l = okKeys.length; i < l; ++i) {
                okKeys[i].onDown.add(function () {
                    if (_this.buttonIndex !== -1) {
                        _this.down(_this.buttonIndex === 0 ? _this.playButton : _this.skillChallengeButton);
                    }
                }, this);
                okKeys[i].onUp.add(function () {
                    if (_this.buttonIndex !== -1) {
                        _this.up(_this.buttonIndex === 0 ? _this.playButton : _this.skillChallengeButton);
                    }
                    else {
                        _this.processButtonIndex();
                    }
                }, this);
            }
            this.playButton.frame = 1;
        };
        MainMenuState.prototype.update = function () {
            if (this.map && this.map.ready) {
                var states = KGAD.States.Instance;
                states.switchTo(KGAD.States.PreGameLoading, true, false, this.map, this.script, this.skillChallenge);
                return;
            }
            else if (this.map && !this.map.ready) {
                return;
            }
            if (this.cursors.up.justDown || this.input.gamepad.justPressed(Phaser.Gamepad.XBOX360_DPAD_UP)) {
                this.decrementButtonIndex();
            }
            else if (this.cursors.down.justDown || this.input.gamepad.justPressed(Phaser.Gamepad.XBOX360_DPAD_DOWN)) {
                this.incrementButtonIndex();
            }
            if (this.input.gamepad.justReleased(Phaser.Gamepad.XBOX360_A)) {
                if (this.buttonIndex !== -1) {
                    this.up(this.buttonIndex === 0 ? this.playButton : this.skillChallengeButton);
                }
                else {
                    this.processButtonIndex();
                }
            }
            else if (this.input.gamepad.justPressed(Phaser.Gamepad.XBOX360_A)) {
                if (this.buttonIndex !== -1) {
                    this.down(this.buttonIndex === 0 ? this.playButton : this.skillChallengeButton);
                }
            }
        };
        MainMenuState.prototype.incrementButtonIndex = function () {
            ++this.buttonIndex;
            this.processButtonIndex();
        };
        MainMenuState.prototype.decrementButtonIndex = function () {
            --this.buttonIndex;
            this.processButtonIndex();
        };
        MainMenuState.prototype.processButtonIndex = function () {
            if (this.buttonIndex < 0) {
                this.buttonIndex = 0;
            }
            if (this.buttonIndex > 1) {
                this.buttonIndex = 1;
            }
            if (this.buttonIndex === 0) {
                this.hover(this.playButton, false);
            }
            else if (this.buttonIndex === 1) {
                this.hover(this.skillChallengeButton, false);
            }
        };
        MainMenuState.prototype.hover = function (button, suppressButtonIndex) {
            if (suppressButtonIndex === void 0) { suppressButtonIndex = true; }
            button.frame = 1;
            if (button === this.skillChallengeButton) {
                this.playButton.frame = 0;
            }
            else {
                this.skillChallengeButton.frame = 0;
            }
            if (suppressButtonIndex) {
                this.buttonIndex = -1;
            }
        };
        MainMenuState.prototype.blur = function (button, suppressButtonIndex) {
            if (suppressButtonIndex === void 0) { suppressButtonIndex = true; }
            button.frame = 0;
            if (suppressButtonIndex) {
                this.buttonIndex = -1;
            }
        };
        MainMenuState.prototype.down = function (button) {
            button.frame = 2;
        };
        MainMenuState.prototype.up = function (button) {
            button.frame = 1;
            if (button === this.skillChallengeButton) {
                this.startSkillChallenge();
            }
            else {
                this.startRegularGame();
            }
        };
        MainMenuState.prototype.startRegularGame = function () {
            this.skillChallenge = false;
            var firstLevel = "level_1";
            this.map = new KGAD.GameMap(firstLevel);
            KGAD.Game.CurrentMap = this.map;
            this.script.create(firstLevel);
        };
        MainMenuState.prototype.startSkillChallenge = function () {
            this.skillChallenge = true;
            var firstLevel = "skill_challenge";
            this.map = new KGAD.GameMap(firstLevel);
            KGAD.Game.CurrentMap = this.map;
            this.script.create(firstLevel);
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
            this.firstTime = true;
        }
        PreGameLoadingState.prototype.init = function (args) {
            this.map = args[0];
            this.script = args[1];
            this.skillChallengeMode = !!args[2];
        };
        PreGameLoadingState.prototype.preload = function () {
            var _this = this;
            this.sprites = [];
            this.map.preload();
            this.script.preload();
            var spritesheets = [
                KGAD.Hero.KEY,
                'king',
                'tank_merc',
            ];
            var keys = this.script.getEnemyKeys();
            for (var j = 0, len = keys.length; j < len; ++j) {
                spritesheets.push(keys[j]);
            }
            var total = spritesheets.length;
            var itemsToLoad = total;
            for (var i = 0; i < total; ++i) {
                var spritesheet = spritesheets[i];
                var name = spritesheet;
                var isHero = name === KGAD.Hero.KEY;
                var isKing = name === 'king';
                var isMerc = name === 'tank_merc';
                var isEnemy = !isKing && !isHero && !isMerc;
                var callback = function (sprite) {
                    _this.sprites[sprite.key] = sprite;
                    --itemsToLoad;
                    if (itemsToLoad <= 0) {
                        _this.ready = true;
                    }
                };
                KGAD.AnimationLoader.load(name, callback, isHero ? KGAD.Hero : isEnemy ? KGAD.Enemy : isKing ? KGAD.King : isMerc ? KGAD.Mercenary : KGAD.AnimatedSprite);
            }
            var mercenaryJson = this.game.cache.getJSON('mercenaries');
            if (mercenaryJson) {
                var mercenaries = mercenaryJson.mercenaries;
                console.log(mercenaries);
                for (var i = 0, l = mercenaries.length; i < l; ++i) {
                    var merc = mercenaries[i];
                    if (merc.key) {
                        KGAD.AnimationLoader.load(merc.key, function (s) {
                        }, KGAD.Mercenary);
                        this.game.cache.addJSON("mercenary_" + merc.key, null, merc);
                    }
                }
            }
            KGAD.AnimationLoader.load('charge', function (s) {
                _this.chargeSprite = s;
            }, KGAD.BowCharge, 'assets/textures/weapons/');
            this.game.load.image('basic_arrow', 'assets/textures/weapons/basic_arrow.png');
            this.game.load.image('basic_arrow_dead', 'assets/textures/weapons/basic_arrow_dead.png');
            this.game.load.image('black', 'assets/textures/misc/black.png');
            this.game.load.image('healthbar', 'assets/textures/misc/healthbar.png');
            this.game.load.image('healthbar_frame', 'assets/textures/misc/healthbar_frame.png');
            this.game.load.image('parchment', 'assets/textures/misc/parchment.png');
            this.game.load.image('gold_coin', 'assets/textures/misc/gold_coin.png');
            this.game.load.image('gold_bar', 'assets/textures/misc/gold_bar.png');
            //this.game.load.image('merc_frame', 'assets/textures/misc/merc_frame.png');
            //this.game.load.image('ready', 'assets/textures/misc/ready_button.png');
            this.game.load.image('shadow', 'assets/textures/misc/shadow.png');
            new KGAD.Button('ready_button', 0, 0, 96, 48);
            new KGAD.Button('merc_frame', 0, 0, 36, 36);
        };
        PreGameLoadingState.prototype.create = function () {
        };
        PreGameLoadingState.prototype.update = function () {
            var states = KGAD.States.Instance;
            if (KGAD.AnimationLoader.done && this.ready) {
                var nextState = this.skillChallengeMode ? KGAD.States.SkillChallengeIntro : KGAD.States.GameSimulation;
                if (!this.skillChallengeMode && this.firstTime) {
                    nextState = KGAD.States.Info;
                    this.firstTime = false;
                }
                states.switchTo(nextState, true, false, this.map, this.script);
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
        Object.defineProperty(GameSimulationState.prototype, "done", {
            get: function () {
                return (this.context != null ? !!this.context['gameComplete'] : false);
            },
            set: function (_done) {
                this.context['gameComplete'] = _done;
            },
            enumerable: true,
            configurable: true
        });
        GameSimulationState.prototype.init = function (args) {
            KGAD.Game.Simulation = this;
            if (args[0] instanceof KGAD.GameContext) {
                this.context = args[0];
                this.createKing = false;
            }
            else {
                this.map = args[0];
                this.script = args[1];
                this.skillChallengeMode = !!args[2];
                this.actors = null;
                this.context = null;
                this.createKing = true;
                this.projectiles = new KGAD.ProjectileManager();
            }
        };
        GameSimulationState.prototype.preload = function () {
            if (!this.actors) {
                this.actors = new KGAD.Actors(this.game, this.map);
            }
        };
        GameSimulationState.prototype.create = function () {
            if (this.createKing) {
                this.map.create();
                this.actors.createKing();
                this.actors.createHero();
            }
            KGAD.GameController.destroyControllers(false);
            this.context = new KGAD.GameContext({
                actors: this.actors,
                game: KGAD.Game.Instance,
                map: KGAD.Game.CurrentMap,
                grid: KGAD.OccupiedGrid,
                projectiles: this.projectiles,
                script: this.script,
                skillChallengeMode: this.skillChallengeMode,
                gameComplete: this.done
            });
            var simulationChildren = [new KGAD.SkillChallengeController()];
            var firstController = KGAD.GameController.createController('SimulationController', KGAD.SimulationController, simulationChildren);
            KGAD.GameController.createController('PrepareDefenseController', KGAD.PrepareDefenseController);
            KGAD.GameController.preload();
            KGAD.GameController.switchTo('SimulationController');
            this.nextRun = 250;
        };
        GameSimulationState.prototype.update = function () {
            if (this.done || KGAD.GameController.current == null) {
                this.switchStates(KGAD.States.Demo, true, false);
                return;
            }
            this.sortSprites();
            KGAD.GameController.current.update();
        };
        GameSimulationState.prototype.render = function () {
            if (!this.done && KGAD.GameController.current != null) {
                KGAD.GameController.current.render();
            }
        };
        /**
         *  Manually sort the world sprites by their 'y' index. This relies on being called repeatedly (once per frame) in order
         * to fully sort the sprites and also to make sure they are sorted by their 'y' position correctly.
         */
        GameSimulationState.prototype.sortSprites = function () {
            var children = this.world.children, len = children.length;
            if (this.done) {
                return;
            }
            this.nextRun -= this.game.time.physicsElapsedMS;
            if (this.nextRun > 0) {
                return;
            }
            this.nextRun = 250;
            for (var i = 0; i < len; ++i) {
                var child1 = children[i];
                if (child1 instanceof Phaser.Sprite) {
                    var y1 = child1.y;
                    for (var j = i + 1; j < len; ++j) {
                        var child2 = children[j];
                        if (child2 instanceof Phaser.Sprite) {
                            var y2 = child2.y;
                            var renderPriority1 = child1.renderPriority || 0;
                            var renderPriority2 = child2.renderPriority || 0;
                            if (renderPriority2 < renderPriority1) {
                                children[i] = child2;
                                children[j] = child1;
                                break;
                            }
                            else if (renderPriority1 === renderPriority2) {
                                if (child1 instanceof Phaser.Sprite && child2 instanceof Phaser.Sprite && y2 < y1) {
                                    children[i] = child2;
                                    children[j] = child1;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        };
        /**
         *  Switch to another state, giving our game context to the target state.
         */
        GameSimulationState.prototype.switchStates = function (state, clearWorld, clearCache) {
            if (clearWorld === void 0) { clearWorld = false; }
            if (clearCache === void 0) { clearCache = false; }
            if (clearWorld) {
                KGAD.GameController.current = null;
                this.context = null;
                this.actors.destroy(true);
                this.actors = null;
            }
            this.game.state.start(state, clearWorld, clearCache, this.context);
        };
        GameSimulationState.prototype.switchControllers = function (controller) {
            KGAD.GameController.current = controller;
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
        Object.defineProperty(States, "SkillChallengeIntro", {
            get: function () {
                return 'SkillChallengeIntro';
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
        Object.defineProperty(States, "Demo", {
            get: function () {
                return 'Demo';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(States, "Info", {
            get: function () {
                return "Info";
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
            game.state.add(States.SkillChallengeIntro, KGAD.SkillChallengeIntroState, false);
            game.state.add(States.GameSimulation, KGAD.GameSimulationState, false);
            game.state.add(States.Demo, KGAD.DemoState, false);
            game.state.add(States.Info, KGAD.InfoState, false);
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
            if (Game.instance != null) {
                throw Error('Cannot create more than one \'Game\' instance!');
            }
            // please note, that IE11 now returns undefined again for window.chrome
            var isChromium = window.chrome, vendorName = window.navigator.vendor;
            var isChrome = (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.");
            var isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());
            var renderer = isFirefox ? Phaser.CANVAS : Phaser.AUTO;
            _super.call(this, width, height, renderer, container);
            Game.instance = this;
            if (!isChrome) {
                $('#messages').append($('<div>').html('For the best experience, please use <a href="https://www.google.com/chrome/browser/">Google Chrome</a>.'));
            }
            if (isFirefox && this.renderType === Phaser.CANVAS) {
                $('#messages').append($('<div>').html('The "damage flicker" on-hit effect is disabled in Firefox canvas rendering mode due to a crashing bug in Phaser/PIXI.'));
            }
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
        Object.defineProperty(Game, "Width", {
            /**
             *  Gets the width of the container area.
             */
            get: function () {
                return $('#container').innerWidth();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game, "Height", {
            /**
             *  Gets the height of the container area.
             */
            get: function () {
                return $('#container').innerHeight();
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
        Object.defineProperty(Game, "Context", {
            /**
             *  Gets the current game context.
             */
            get: function () {
                return this.Simulation == null ? null : this.Simulation.context;
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
        var game = null;
        (function () {
            var hidden = "hidden";
            // Standards:
            if (hidden in document)
                document.addEventListener("visibilitychange", onchange);
            else if ((hidden = "mozHidden") in document)
                document.addEventListener("mozvisibilitychange", onchange);
            else if ((hidden = "webkitHidden") in document)
                document.addEventListener("webkitvisibilitychange", onchange);
            else if ((hidden = "msHidden") in document)
                document.addEventListener("msvisibilitychange", onchange);
            else if ("onfocusin" in document)
                document.onfocusin = document.onfocusout = onchange;
            else
                window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
            function onchange(evt) {
                var v = "visible", h = "hidden", evtMap = {
                    focus: v,
                    focusin: v,
                    pageshow: v,
                    blur: h,
                    focusout: h,
                    pagehide: h
                };
                evt = evt || window.event;
                if (evt.type in evtMap)
                    document.body.className = evtMap[evt.type];
                else
                    document.body.className = this[hidden] ? "hidden" : "visible";
                if (game) {
                    if (document.body.className.match(/hidden/)) {
                        game.input.gamepad.stop();
                    }
                    else {
                        game.input.gamepad.start();
                    }
                }
            }
            // set the initial state (but only if browser supports the Page Visibility API)
            if (document[hidden] !== undefined)
                onchange({ type: document[hidden] ? "blur" : "focus" });
        })();
        $('#content').html('');
        var width = $('#container').innerWidth();
        var height = $('#container').innerHeight();
        console.log('game size: ' + width + 'x' + height);
        game = new KGAD.Game(width, height, 'content');
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
            var loopEvent = null;
            loopEvent = this.game.time.events.loop(1000, function () {
                if (_this.exists && _this.game != null && _this.alive) {
                    _this.forEachMercenary(function (merc) {
                        if (merc.alive) {
                            _this.forEachEnemy(function (enemy) {
                                if (enemy.alive) {
                                    merc.checkThreatAgainst(enemy);
                                }
                            }, _this);
                        }
                    }, _this);
                }
                else {
                    _this.game.time.events.remove(loopEvent);
                }
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
        Actors.prototype.create = function (x, y, key, frame, exists, addToWorld) {
            if (addToWorld === void 0) { addToWorld = true; }
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
            if (addToWorld && typeof created.addToWorld === 'function') {
                created.addToWorld();
            }
            //this.children.push(created);
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
            enemy.position.set(position.x, position.y);
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
        Actors.prototype.createMercenary = function (x, y, mercType) {
            this.classType = KGAD.Mercenary;
            var merc = this.create(x, y, mercType.key, null, null, false);
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
            this.sort('y', Phaser.Group.SORT_ASCENDING);
            _super.prototype.update.call(this);
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
        Object.defineProperty(Actions, "Frontswinging", {
            get: function () {
                return 'frontswing';
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
        Object.defineProperty(Actions, "ChargeWalking", {
            get: function () {
                return 'charge_walk';
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
        Object.defineProperty(Actions, "Backswinging", {
            get: function () {
                return 'backswing';
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
            var tintValue = 0xFF3333;
            if (game.device.firefox && game.renderType === Phaser.CANVAS) {
                // Canvas tint rendering + Phaser 2.2.1 is broken
                tintValue = 0xFFFFFF;
            }
            var tween = game.add.tween(obj).to({ tint: tintValue }, 35, Phaser.Easing.Cubic.InOut, false, 0, 2, true);
            obj.tint = 0xFFFFFF;
            return tween;
        };
        AnimationHelper.createTextPopup = function (text, fadeInDelay, fadeOutDelay, onComplete) {
            if (fadeInDelay === void 0) { fadeInDelay = 300; }
            if (fadeOutDelay === void 0) { fadeOutDelay = 3000; }
            var game = KGAD.Game.Instance;
            var y = 125;
            var shadowProps = {
                centeredX: true,
                y: y + 1,
                fixedToCamera: true,
                style: {
                    font: '36px MedievalSharpBook',
                    fill: '#000000'
                }
            };
            var shadowText = KGAD.Text.createText(text, shadowProps);
            var shadowText2 = KGAD.Text.createText(text, shadowProps);
            shadowText.alpha = 0;
            shadowText2.alpha = 0;
            var headerText = KGAD.Text.createText(text, {
                centeredX: true,
                y: y,
                fixedToCamera: true,
                style: {
                    font: '36px MedievalSharpBook'
                }
            });
            headerText.alpha = 0;
            shadowText.preUpdate = function () {
                shadowText.x = headerText.x - 1;
                shadowText.y = headerText.y - 1;
                shadowText2.x = headerText.x + 1;
                shadowText2.y = headerText.y + 1;
                shadowText.alpha = headerText.alpha;
                shadowText2.alpha = headerText.alpha;
            };
            game.world.add(shadowText);
            game.world.add(shadowText2);
            game.world.add(headerText);
            var fadeIn = game.add.tween(headerText).to({ y: 70, alpha: 1 }, fadeInDelay, Phaser.Easing.Linear.None, false, 0);
            var flash = game.add.tween(headerText).to({ tint: 0xFF00FF }, 100, Phaser.Easing.Cubic.InOut, true, 0, 0, true);
            fadeIn.onComplete.addOnce(function () {
                var fadeOut = game.add.tween(headerText).to({ y: 75, alpha: 0 }, fadeInDelay, Phaser.Easing.Linear.None, false, fadeOutDelay);
                if (onComplete) {
                    fadeOut.onComplete.addOnce(onComplete);
                }
                fadeOut.start();
            });
            fadeIn.start();
        };
        AnimationHelper.createTextSubPopup = function (text, fadeInDelay, fadeOutDelay, onComplete) {
            if (fadeInDelay === void 0) { fadeInDelay = 300; }
            if (fadeOutDelay === void 0) { fadeOutDelay = 3000; }
            var game = KGAD.Game.Instance;
            var y = 165;
            var shadowText = KGAD.Text.createText(text, {
                centeredX: true,
                y: y + 1,
                fixedToCamera: true,
                style: {
                    font: '24px MedievalSharpBook',
                    fill: '#000000'
                }
            });
            shadowText.alpha = 0;
            var headerText = KGAD.Text.createText(text, {
                centeredX: true,
                y: y,
                fixedToCamera: true,
                style: {
                    font: '24px MedievalSharpBook',
                    fill: '#EEEEEE'
                }
            });
            headerText.alpha = 0;
            shadowText.preUpdate = function () {
                shadowText.x = headerText.x - 1;
                shadowText.y = headerText.y - 1;
                shadowText.alpha = headerText.alpha;
            };
            game.world.add(shadowText);
            game.world.add(headerText);
            var fadeIn = game.add.tween(headerText).to({ y: 70, alpha: 1 }, fadeInDelay, Phaser.Easing.Linear.None, false, 0);
            fadeIn.onComplete.addOnce(function () {
                var fadeOut = game.add.tween(headerText).to({ y: 75, alpha: 0 }, fadeInDelay, Phaser.Easing.Linear.None, false, fadeOutDelay);
                if (onComplete) {
                    fadeOut.onComplete.addOnce(onComplete);
                }
                fadeOut.start();
            });
            fadeIn.start();
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
            this.autoCull = false;
            this.checkWorldBounds = false;
            this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            //this.texture.baseTexture.mipmap = true;
            this.anchor.setTo(0.5);
            this.action = KGAD.Actions.Standing;
            this.direction = 2 /* Down */;
            this.added = false;
            this.canOccupy = true;
            this.isBlocked = false;
            this.sequentialBlocks = 0;
            this._pathing = false;
            this.blocked = new Phaser.Signal();
            this.movementTweenCompleted = new Phaser.Signal();
            this.pathfindingComplete = new Phaser.Signal();
            this.pathFindingMover = new KGAD.PathMovementMachine(this);
            this.movementSpeed = 100;
            this.fixedToCamera = false;
            this.renderPriority = 0;
            this.visible = false;
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
            this.healthBar = new KGAD.HealthBar(this.game, this);
            this.healthBar.init(this.health);
            this.healthBar.visible = false;
        };
        Object.defineProperty(AnimatedSprite.prototype, "hasShadow", {
            get: function () {
                return this.shadowSprite != null;
            },
            set: function (val) {
                if (val && this.shadowSprite == null) {
                    this.shadowSprite = this.game.add.sprite(this.x, this.y + this.height / 2.75, 'shadow');
                    this.shadowSprite.anchor.set(0.5, 0);
                    this.shadowSprite.renderPriority = -5;
                }
                else if (!val && this.shadowSprite != null) {
                    this.shadowSprite.kill();
                    this.shadowSprite = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimatedSprite.prototype, "hasHealthBar", {
            get: function () {
                return this._hasHealthBar;
            },
            set: function (_hasHealthBar) {
                var addHealthBar = !this._hasHealthBar && this._hasHealthBar !== _hasHealthBar;
                var removeHealthBar = this._hasHealthBar && this._hasHealthBar !== _hasHealthBar;
                this._hasHealthBar = _hasHealthBar;
                if (addHealthBar) {
                    this.healthBar.visible = true;
                }
                else if (removeHealthBar) {
                    this.healthBar.visible = false;
                }
            },
            enumerable: true,
            configurable: true
        });
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
        Object.defineProperty(AnimatedSprite.prototype, "weight", {
            get: function () {
                if (this.action === KGAD.Actions.Dying || this.action === KGAD.Actions.Dead) {
                    return 1;
                }
                else if (this.action === KGAD.Actions.Firing) {
                    return 0;
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
        AnimatedSprite.prototype.preload = function () {
        };
        AnimatedSprite.prototype.addToWorld = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            if (!this.added) {
                this.default_animation = KGAD.AnimationHelper.getCurrentAnimation(this);
                var animation = this.animations.getAnimation(this.default_animation);
                if (animation != null) {
                    this.animations.play(this.default_animation);
                }
                this.added = true;
                this.visible = true;
            }
            this.lastPosition = this.position.clone();
            this.lastNode = this.node;
            this.node = new Phaser.Point(Math.floor(this.x / KGAD.OccupiedGrid.NODE_SIZE), Math.floor(this.y / KGAD.OccupiedGrid.NODE_SIZE));
            var addCallback = null;
            addCallback = function () {
                if (!force && !KGAD.OccupiedGrid.canOccupyInPixels(_this, _this.position)) {
                    console.log('spawn point is occupied; waiting for it to free up');
                    _this.game.time.events.add(100, function () {
                        addCallback();
                    }, _this);
                }
                else {
                    KGAD.OccupiedGrid.add(_this);
                    var beforePosition = _this.position.clone();
                    _this.game.world.add(_this, true);
                    var afterPosition = _this.position.clone();
                    if (!beforePosition.equals(afterPosition)) {
                        console.error("POSITION CHANGED: Before: " + beforePosition.toString() + ", After: " + afterPosition.toString());
                        _this.position = beforePosition;
                    }
                    if (!(_this instanceof KGAD.Hero || _this instanceof KGAD.King)) {
                        _this.alpha = 0;
                    }
                    _this.game.add.tween(_this).to({ alpha: 1 }, 250, Phaser.Easing.Linear.None, true, 0);
                    // TODO: Why is this necessary? What's messing with the enemy's position after spawn?
                    var resetPosition = _this.position.clone();
                    _this.game.time.events.add(1, function () {
                        _this.position = resetPosition;
                    }, _this);
                }
            };
            this._cache[7] = 0;
            addCallback();
        };
        /**
         *  Face towards another sprite.
         */
        AnimatedSprite.prototype.face = function (sprite) {
            if (typeof sprite === 'number') {
                this.direction = sprite;
            }
            else {
                var angle = this.game.physics.arcade.angleBetween(this.position, sprite.position);
                this.direction = KGAD.MovementHelper.getDirectionFromAngle(angle);
            }
            this.updateAnimation();
        };
        /**
         *  Updates the animation for the sprite.
         */
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
                if (onComplete && player != null) {
                    player.onComplete.addOnce(onComplete);
                }
            }
        };
        /**
         *  Inflict damage to the sprite. This will show a damage tween and update the animation.
         */
        AnimatedSprite.prototype.inflictDamage = function (amount, source) {
            _super.prototype.damage.call(this, amount);
            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }
            this.damageTween = KGAD.AnimationHelper.createDamageTween(this);
            this.damageTween.start();
            if (this.health <= 0) {
                KGAD.OccupiedGrid.remove(this);
                this.healthBar.destroy();
                if (this.shadowSprite) {
                    this.shadowSprite.kill();
                    this.hasShadow = false;
                }
                this.showDeathAnimation();
            }
            return this;
        };
        /**
         *  Shows the sprite's death animation, if it has one.
         */
        AnimatedSprite.prototype.showDeathAnimation = function (onDeathAnimationComplete) {
            var _this = this;
            this.stopMovementTween();
            var onAnimationComplete = function () {
                _this.action = KGAD.Actions.Dead;
                _this.updateAnimation();
                var targetAlpha = 0;
                _this.game.add.tween(_this).to({ alpha: targetAlpha }, 500).start().onComplete.addOnce(function () {
                    if (onDeathAnimationComplete) {
                        onDeathAnimationComplete();
                    }
                    _this.kill();
                });
            };
            this.action = KGAD.Actions.Dying;
            this.direction = 2 /* Down */;
            var animationName = KGAD.AnimationHelper.getCurrentAnimation(this);
            if (this.animations.getAnimation(animationName) == null) {
                this.action = KGAD.Actions.Dead;
            }
            this.updateAnimation(onAnimationComplete);
        };
        /**
         *  Kills the sprite, removing it from the game.
         */
        AnimatedSprite.prototype.kill = function () {
            if (this.pathFindingMover) {
                this.pathFindingMover.currentPath = null;
            }
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
                return false;
            }
            this.stopMovementTween();
            if (!KGAD.OccupiedGrid.canOccupyInPixels(this, position.x, position.y)) {
                return false;
            }
            var savedPosition = new Phaser.Point(this.x, this.y);
            this.position = new Phaser.Point(position.x, position.y);
            this.position = savedPosition;
            var timeToMove = (distance / this.movementSpeed) * 1000.0;
            this.movementTween = new KGAD.MoveTween(this.game, this);
            this.movementTween.moveTo(position.x, position.y);
            this.movementTween.completed.addOnce(function () {
                _this.movementTweenCompleted.dispatch();
            });
            this.movementTween.blocked.addOnce(function (collisions) {
                _this.blocked.dispatch(collisions);
            });
            return true;
        };
        /**
         *  Find a path to and begin moving to the target destination.
         */
        AnimatedSprite.prototype.pathfindTo = function (x, y, onComplete, customNodes) {
            if (customNodes === void 0) { customNodes = []; }
            this.stopMovementTween(false);
            var current = this.map.fromPixels(this.x, this.y);
            var target = this.map.fromPixels(x, y);
            var points = this.map.findPath(current, target, false, customNodes);
            if (!points) {
                return false;
            }
            var gridPath = KGAD.OccupiedGrid.convertToGridPath(new KGAD.Path(points));
            this.pathFindingMover.currentPath = gridPath;
            if (onComplete) {
                this.pathfindingComplete.addOnce(onComplete);
            }
            this._pathing = true;
            return true;
        };
        /**
         *  Update the internal understanding of our node position.
         */
        AnimatedSprite.prototype.updateNodePosition = function () {
            this.lastNode = this.node;
            this.node = new Phaser.Point(Math.floor(this.x / KGAD.OccupiedGrid.NODE_SIZE), Math.floor(this.y / KGAD.OccupiedGrid.NODE_SIZE));
        };
        /**
         *  Un-sets the current path, allowing a new one to be created.
         */
        AnimatedSprite.prototype.unsetCurrentPath = function () {
            if (this.pathFindingMover) {
                this.pathFindingMover.currentPath = null;
            }
            return null;
        };
        /**
         *  Moves to the next destination in the pathfinding node.
         */
        AnimatedSprite.prototype.moveToNextDestination = function () {
            if (this.isMoveTweening()) {
                return false;
            }
            var path = this.pathFindingMover.currentPath;
            if (path == null) {
                return false;
            }
            var rect = path.next();
            if (rect == null) {
                if (this._pathing) {
                    this.pathfindingComplete.dispatch();
                    this._pathing = false;
                }
                this.unsetCurrentPath();
                return false;
            }
            var center = new Phaser.Point(rect.centerX, rect.centerY);
            var angle = this.game.physics.arcade.angleBetween(this.position, center);
            this.direction = KGAD.MovementHelper.getDirectionFromAngle(angle);
            this.action = KGAD.Actions.Moving;
            this.updateAnimation();
            this.moveTweenTo(center);
            return true;
        };
        /**
         *  Called before the 'update' step.
         */
        AnimatedSprite.prototype.preUpdate = function () {
            //(<any>this)._cache[4] = 0;
            var map = KGAD.Game.CurrentMap;
            if (!this.alive || !this.exists || this.health <= 0) {
                _super.prototype.preUpdate.call(this);
                return;
            }
            if (this.pathFindingMover.currentPath && this.pathFindingMover.currentPath.length > 0 && !this.isMoveTweening()) {
                this.moveToNextDestination();
            }
            if (this.movementTween != null && this.movementTween.isRunning) {
                this.movementTween.update();
            }
            else {
                if (this.canOccupyTiles && (this instanceof KGAD.Hero)) {
                    var occupants = [];
                    if (!KGAD.OccupiedGrid.add(this, occupants)) {
                        ++this.sequentialBlocks;
                        this.position = this.lastPosition.clone();
                        if (this.body) {
                            this.body.velocity.setTo(0);
                        }
                        this.stopMovementTween();
                        this.isBlocked = true;
                        this.blocked.dispatch(occupants);
                    }
                    else {
                        this.sequentialBlocks = 0;
                        this.isBlocked = false;
                    }
                    occupants = [];
                    if (this.sequentialBlocks > 15 || !KGAD.OccupiedGrid.canOccupyInPixels(this, this.position, null, occupants)) {
                    }
                }
            }
            this.updateNodePosition();
            this.lastPosition = new Phaser.Point(this.position.x, this.position.y);
            _super.prototype.preUpdate.call(this);
        };
        /**
         *
         */
        AnimatedSprite.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this.shadowSprite) {
                this.shadowSprite.position.set(this.x, this.y + this.height / 3);
            }
            this.healthBar.update();
        };
        AnimatedSprite.prototype.postUpdate = function () {
            this._cache[7] = 0;
            _super.prototype.postUpdate.call(this);
        };
        AnimatedSprite.prototype.render = function () {
            this.pathFindingMover.render();
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
        function Weapon(game, key, opts) {
            this.game = game;
            this.key = key;
            this.frontSwing = 0;
            this.backSwing = 0;
            this.range = 32;
            this.setOptions(opts);
            this.lastFire = 0;
            this.chargeTime = 0;
            this.charging = false;
            this.minimumChargeTime = 240;
            this.fullChargeTime = 1000;
        }
        Weapon.prototype.setOptions = function (opts) {
            opts = opts || {};
            this.frontSwing = opts.frontSwing || 0;
            this.backSwing = opts.backSwing || 0;
            this.range = opts.range || KGAD.GameMap.TILE_WIDTH;
            this.deadKey = opts.deadProjectileKey || null;
            this.chargeSprite = opts.chargeSprite || null;
            this.projectileSpeed = opts.projectileSpeed || 1;
            this.power = opts.power || 1;
            this.aliveTime = opts.aliveTime || 5000;
            this.cooldown = opts.cooldown || 0;
            this.minimumChargeTime = opts.chargeTime || 240;
            this.fullChargeTime = opts.fullChargeTime || 1000;
        };
        Object.defineProperty(Weapon.prototype, "deadProjectileKey", {
            get: function () {
                return this.deadKey;
            },
            set: function (key) {
                this.deadKey = key;
            },
            enumerable: true,
            configurable: true
        });
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
        Weapon.prototype.isFrontSwinging = function () {
            var delta = this.game.time.now - this.frontSwingTime;
            return delta < this.frontSwing;
        };
        Weapon.prototype.startFrontSwinging = function () {
            this.frontSwingTime = this.game.time.now;
            return this.isFrontSwinging();
        };
        Weapon.prototype.isCharging = function () {
            this.chargeTime = this.game.time.now - this.chargeStartTime;
            if (this.chargeTime >= this.minimumChargeTime) {
                return this.charging;
            }
            else {
                return false;
            }
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
            this.rerouting = false;
            this.health = 3;
            this.goldValue = 1;
        }
        Enemy.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.hasHealthBar = true;
            this.body.immovable = true;
            this.weapon = new KGAD.Weapon(this.game, 'short_sword', {
                cooldown: 1500,
                range: 42,
                backSwing: 500,
                power: 1,
            });
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
            this.hasShadow = true;
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
                    return 20;
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
                KGAD.Game.Hero.gold += this.goldValue;
            }
            if (this.health <= 0) {
                if (this.shadowSprite) {
                    this.shadowSprite.kill();
                    this.hasShadow = false;
                }
                if (!KGAD.OccupiedGrid.remove(this)) {
                    console.error("Enemy was not removed!");
                }
                this.showDeathAnimation();
            }
            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }
            //this.damageTween = this.game.add.tween(this).to({ tint: 0xFF3333 }, 35, Phaser.Easing.Cubic.InOut, true, 0, 2, true);
            this.damageTween = KGAD.AnimationHelper.createDamageTween(this);
            this.damageTween.start();
            return this;
        };
        Enemy.prototype.showDeathAnimation = function () {
            var _this = this;
            this.stopMovementTween();
            this.unsetCurrentPath();
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
            while (this.currentTarget == null) {
                this.currentTarget = this.threatTable.getHighestThreatTarget();
                if (this.currentTarget != null && !this.canReach(this.currentTarget)) {
                    if (!(this.currentTarget instanceof KGAD.King)) {
                        this.threatTable.removeThreatTarget(this.currentTarget);
                    }
                    else {
                        break;
                    }
                }
                else {
                    if (this.currentTarget == null) {
                        this.debugStateName = 'no_target';
                        return;
                    }
                    break;
                }
            }
            if (this.weapon.isBackSwinging() || this.rerouting || this.isMoveTweening()) {
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
            if (this.health <= 0) {
                return;
            }
            //this.game.debug.text(this.debugStateName, this.position.x - 16, this.position.y - 16, '#FFFFFF', '12px Courier new');
            this.pathFindingMover.render();
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
            var currentPath = null;
            if (path == null || path.length === 0) {
                // Find a path to the target.
                var tilePosition = map.fromPixels(this.position);
                currentPath = map.findPath(tilePosition, targetPositionTiles);
                this.pathFindingMover.setCurrentPath(new KGAD.Path(currentPath));
            }
            ;
            if (this.pathFindingMover.currentPath != null && this.pathFindingMover.currentPath.length > 0) {
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
            if (sprite == null || this.canReach(sprite)) {
                this.currentTarget = sprite;
                this.unsetCurrentPath();
            }
        };
        /**
         *  Check if we can reach the current target.
         */
        Enemy.prototype.canReach = function (sprite) {
            if (sprite instanceof KGAD.Mercenary) {
                if (sprite.isPerched) {
                    return false;
                }
            }
            var from = this.map.fromPixels(this.position);
            var to = this.map.fromPixels(sprite.position);
            return this.map.findPath(from, to, true) != null;
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
            this.goThroughWalls = false;
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
            //this.direction = MovementHelper.getDirectionFromAngle(this.rotation);
            if (this.direction == 0 /* Up */ || this.direction == 2 /* Down */) {
                var h = this.body.width;
                this.body.width = this.body.height;
                this.body.height = h;
            }
            this.aliveTime = this.lifespan;
        };
        Object.defineProperty(FiredProjectile.prototype, "deadSpriteKey", {
            get: function () {
                return this._deadSpriteKey;
            },
            set: function (key) {
                this._deadSpriteKey = key;
            },
            enumerable: true,
            configurable: true
        });
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
            this.wallWasHit = true;
            this.attachedTo = who;
            this.dead = true;
            if (this._deadSpriteKey) {
                this.loadTexture(this._deadSpriteKey, 0, false);
            }
            this.game.time.events.add(3000, function () {
                _this.game.add.tween(_this).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.addOnce(function () {
                    _this.kill();
                });
            }, this);
            this.offsetPosition = Phaser.Point.subtract(this.attachedTo.position, this.position).divide(2, 2);
            this.originalDirection = who.direction;
        };
        FiredProjectile.prototype.hitWall = function () {
            this.wallWasHit = true;
            this.dead = true;
            if (this._deadSpriteKey) {
                this.createDeadProjectile();
            }
            this.kill();
        };
        FiredProjectile.prototype.update = function () {
            if (!this.dead && this.aliveTime > 0) {
                this.aliveTime -= this.game.time.physicsElapsedMS;
                if (this.aliveTime <= 0) {
                    this.hitWall();
                }
            }
            if (this.attachedTo != null) {
                this.position = Phaser.Point.subtract(this.attachedTo.position, this.offsetPosition);
                if (this.attachedTo.direction != this.originalDirection) {
                }
                if (this.attachedTo.alpha < 1) {
                    this.alpha = Math.min(this.alpha, this.attachedTo.alpha);
                }
            }
        };
        FiredProjectile.prototype.createDeadProjectile = function () {
            var _this = this;
            if (!this.deadSpriteKey) {
                return;
            }
            var pos = new Phaser.Point(this.x + Math.cos(angle) * 3, this.y + Math.sin(angle) * 3);
            if (this.hitWallPoint && this.wallWasHit) {
                pos = this.hitWallPoint;
            }
            var sprite = this.game.add.sprite(pos.x, pos.y, this.deadSpriteKey);
            sprite.renderPriorty = this.renderPriority - 1;
            sprite.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            var angle = KGAD.MovementHelper.getAngleFromDirection(this.direction);
            sprite.rotation = angle;
            sprite.anchor.set(1, 0.5);
            this.game.time.events.add(this.weapon.aliveTime, function () {
                _this.game.add.tween(sprite).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
            }, this);
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
            this.health = 5;
            this._disableInput = false;
            this.gold = 10;
        }
        Hero.prototype.addGamepadButtons = function () {
            var gamepad = this.game.input.gamepad;
            gamepad.start();
            var lastLeftRightValue = false;
            var lastUpDownValue = false;
            gamepad.addCallbacks(this, {
                onConnect: this.onGamepadConnected,
                onDisconnect: this.onGamepadDisconnected
            });
            if (gamepad.padsConnected < 1) {
                return false;
            }
            this.onGamepadConnected();
            return true;
        };
        Hero.prototype.onGamepadConnected = function () {
            /*var pad = this.getFirstConnectedPad();
            if (pad == null) {
                return false;
            }*/
            var _this = this;
            this.pad = this.getFirstConnectedPad();
            this.padIndex = this.pad ? this.pad.index : -1;
            if (!this.pad) {
                return false;
            }
            console.log('gamepad connected!');
            var buttons = [];
            buttons[0 /* Up */] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_UP);
            buttons[2 /* Down */] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN);
            buttons[1 /* Left */] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT);
            buttons[3 /* Right */] = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT);
            for (var i = 0; i < buttons.length; ++i) {
                var button = buttons[i];
                if (button) {
                    this.keys[i].push(button);
                    this.addMovementHandler(button, i);
                }
            }
            var fireButton = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
            fireButton.onDown.add(function () {
                _this.fireKeyDown();
            });
            fireButton.onUp.add(function () {
                _this.fireKeyUp();
            });
            this.fireKey.push(fireButton);
        };
        Hero.prototype.onGamepadDisconnected = function (pad, idx) {
            console.log('gamepad disconnected!');
            if (this.padIndex === idx) {
                this.pad = null;
                this.padIndex = -1;
            }
            var removeList = [];
            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    removeList = [];
                    var keys = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];
                        if (key instanceof Phaser.GamepadButton) {
                            removeList.push(key);
                        }
                    }
                    KGAD.Arrays.removeAll(removeList, keys);
                }
            }
            removeList = [];
            for (var j = 0, m = this.fireKey.length; j < m; ++j) {
                var button = this.fireKey[j];
                if (button instanceof Phaser.GamepadButton) {
                    removeList.push(button);
                }
            }
            KGAD.Arrays.removeAll(removeList, this.fireKey);
        };
        /**
         *  Gets the first gamepad that is connected.
         */
        Hero.prototype.getFirstConnectedPad = function () {
            var gamepad = this.game.input.gamepad;
            return gamepad.pad1.connected ? gamepad.pad1 : gamepad.pad2.connected ? gamepad.pad2 : gamepad.pad3.connected ? gamepad.pad3 : gamepad.pad4.connected ? gamepad.pad4 : null;
        };
        Object.defineProperty(Hero.prototype, "disableInput", {
            get: function () {
                return this._disableInput;
            },
            set: function (disable) {
                this.movementKeyState.up = false;
                this.movementKeyState.left = false;
                this.movementKeyState.right = false;
                this.movementKeyState.down = false;
                this._disableInput = disable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hero.prototype, "weight", {
            get: function () {
                if (this.moving) {
                    return 1;
                }
                return 2;
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
            this.hasHealthBar = true;
            this.keys = {};
            this.movementKeyState = {
                up: false,
                left: false,
                right: false,
                down: false
            };
            this.canMove = true;
            this.inFiringMotion = false;
            var keyboard = this.game.input.keyboard;
            this.keys[0 /* Up */] = [keyboard.addKey(Phaser.Keyboard.UP), keyboard.addKey(Phaser.Keyboard.W)];
            this.keys[1 /* Left */] = [keyboard.addKey(Phaser.Keyboard.LEFT), keyboard.addKey(Phaser.Keyboard.A)];
            this.keys[2 /* Down */] = [keyboard.addKey(Phaser.Keyboard.DOWN), keyboard.addKey(Phaser.Keyboard.S)];
            this.keys[3 /* Right */] = [keyboard.addKey(Phaser.Keyboard.RIGHT), keyboard.addKey(Phaser.Keyboard.D)];
            this.fireKey = [keyboard.addKey(Phaser.Keyboard.Z), keyboard.addKey(Phaser.Keyboard.Y), keyboard.addKey(Phaser.Keyboard.SPACEBAR)];
            this.addGamepadButtons();
            this.weapon = new KGAD.Weapon(this.game, 'basic_arrow', {
                cooldown: 400,
                frontSwing: 240,
                range: 5000,
                aliveTime: 5000,
                power: 1,
                projectileSpeed: 750,
                chargeTime: 240,
                fullChargeTime: 1000,
                deadProjectileKey: 'basic_arrow_dead',
            });
            this.weapon.preload();
            this.movementSpeed = 150;
            this.health = 5;
            this.moving = false;
            this.chargeDirection = null;
            this.movingDirection = null;
            this.weapon.chargeSprite = new KGAD.BowCharge(this.game, 0, 0, 'charge');
            this.weapon.chargeSprite.init();
            this.body.immovable = true;
            this.lastTile = KGAD.Game.CurrentMap.fromPixels(this.position);
            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    console.log('direction: ' + KGAD.MovementHelper.getNameOfDirection(direction));
                    var keys = this.keys[direction];
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];
                        this.addMovementHandler(key, direction);
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
        Hero.prototype.addToWorld = function () {
            _super.prototype.addToWorld.call(this);
            this.hasShadow = true;
        };
        Hero.prototype.addMovementHandler = function (input, direction) {
            var _this = this;
            input.onDown.add(function () {
                _this.setMovementState(direction, true);
            });
            input.onUp.add(function () {
                _this.setMovementState(direction, false);
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
            if (!result && this.padIndex >= 0 && this.game.device.firefox) {
                // Firefox uses axis codes 5 (left/right) and 6 (up/down) for d-pad movement.
                var LEFT_RIGHT_AXIS = 5;
                var UP_DOWN_AXIS = 6;
                var value = false;
                if (dir === 1 /* Left */ || dir === 3 /* Right */) {
                    value = this.pad.axis(LEFT_RIGHT_AXIS);
                    if ((value === 1 && dir === 3 /* Right */) || (value === -1 && dir === 1 /* Left */)) {
                        result = true;
                    }
                }
                else if (dir === 0 /* Up */ || dir === 2 /* Down */) {
                    value = this.pad.axis(UP_DOWN_AXIS);
                    if ((value === 1 && dir === 2 /* Down */) || (value === -1 && dir === 0 /* Up */)) {
                        result = true;
                    }
                }
            }
            return result;
        };
        Hero.prototype.checkGamepadDpadForFirefox = function () {
            if (this.game.device.firefox && this.pad) {
                var LEFT_RIGHT_AXIS = 5;
                var UP_DOWN_AXIS = 6;
                var value = this.pad.axis(LEFT_RIGHT_AXIS);
                if (value === 1) {
                    this.movementKeyState.left = false;
                    this.movementKeyState.right = true;
                }
                else if (value === -1) {
                    this.movementKeyState.left = true;
                    this.movementKeyState.right = false;
                }
                else {
                    this.movementKeyState.left = false;
                    this.movementKeyState.right = false;
                }
                value = this.pad.axis(UP_DOWN_AXIS);
                if (value === 1) {
                    this.movementKeyState.up = false;
                    this.movementKeyState.down = true;
                }
                else if (value === -1) {
                    this.movementKeyState.up = true;
                    this.movementKeyState.down = false;
                }
                else {
                    this.movementKeyState.up = false;
                    this.movementKeyState.down = false;
                }
                this.updateMovementState();
            }
        };
        Hero.prototype.isFireKeyDown = function () {
            for (var i = 0, l = this.fireKey.length; i < l; ++i) {
                var key = this.fireKey[i];
                if (key.isDown) {
                    return true;
                }
            }
            return false;
        };
        Hero.prototype.isFireKeyUp = function () {
            var isUp = true;
            for (var i = 0, l = this.fireKey.length; i < l; ++i) {
                var key = this.fireKey[i];
                if (key.isDown) {
                    isUp = false;
                    break;
                }
            }
            return isUp;
        };
        Hero.prototype.fireKeyDown = function () {
            var _this = this;
            if (this.disableInput || !this.alive || !this.weapon.canFire || this.weapon.isFrontSwinging() || this.weapon.isBackSwinging()) {
                return;
            }
            this.inFiringMotion = true;
            this.action = KGAD.Actions.Frontswinging;
            this.updateAnimation(function () {
                if (_this.weapon.isCharging()) {
                    _this.action = KGAD.Actions.Charging;
                    _this.updateAnimation();
                }
            });
            this.weapon.startFrontSwinging();
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
            if (this.disableInput || !this.alive || !this.weapon.canFire || !this.inFiringMotion || this.weapon.isFrontSwinging()) {
                return;
            }
            var chargePower = this.weapon.stopCharging();
            this.fire(chargePower);
        };
        Hero.prototype.fire = function (chargePower) {
            var _this = this;
            if (!this.alive) {
                return;
            }
            var projectiles = KGAD.Game.Projectiles;
            if (this.weapon.canFire) {
                this.action = KGAD.Actions.Firing;
                this.updateAnimation(function () {
                    if (_this.weapon.isBackSwinging()) {
                        _this.action = KGAD.Actions.Backswinging;
                        _this.updateAnimation();
                    }
                });
                projectiles.fire(this.x, this.y, this, this.weapon, chargePower);
                this.inFiringMotion = false;
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
                if (!this.moving) {
                    this.chargeDirection = null;
                }
                this.updateMovementState();
                this.chargeDirection = null;
            }
        };
        /**
         *  Handle moving in the given direction.
         */
        Hero.prototype.handleMovement = function (direction) {
            if (this.disableInput || !this.canMove) {
                return;
            }
            if (!this.alive) {
                return;
            }
            //var nextTile: Phaser.Point = Phaser.Point.add(this.tilePosition, MovementHelper.getPointFromDirection(direction));
            if (this.inFiringMotion && this.chargeDirection != null) {
                this.direction = this.chargeDirection;
            }
            else {
                this.direction = direction;
            }
            this.movingDirection = direction;
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
            this.moving = true;
            var speed = this.weapon.isCharging() ? this.movementSpeed / 3 : this.movementSpeed;
            this.updateCurrentAction();
            this.updateAnimation();
            //MovementHelper.move(this, direction, speed);
            //var timeToMove = this.weapon.isCharging() ? this.movementSpeed * 2 : this.movementSpeed;
            //this.moveToNextTile(timeToMove);
        };
        Hero.prototype.updateCurrentAction = function () {
            if (!this.inFiringMotion) {
                if (this.moving) {
                    this.action = KGAD.Actions.Moving;
                }
                else {
                    this.action = KGAD.Actions.Standing;
                }
            }
            else {
                if (this.weapon.isFrontSwinging()) {
                    this.action = KGAD.Actions.Frontswinging;
                }
                else if (this.weapon.isBackSwinging()) {
                    this.action = KGAD.Actions.Backswinging;
                }
                else if (this.weapon.isCharging()) {
                    if (this.moving) {
                        this.action = KGAD.Actions.ChargeWalking;
                    }
                    else {
                        this.action = KGAD.Actions.Charging;
                    }
                }
            }
            this.updateAnimation();
        };
        /**
         *  Move to the next tile.
         */
        /*private moveToNextTile(speed: number) {
            var nextPosition: Phaser.Point = <Phaser.Point>Game.CurrentMap.toPixels(this.nextTile);

            this.movementTween = this.game.add.tween(this);
            this.movementTween.to({ x: nextPosition.x + GameMap.TILE_WIDTH / 2, y: nextPosition.y + GameMap.TILE_HEIGHT / 2 }, speed, Phaser.Easing.Linear.None, false, 0);
            this.movementTween.onComplete.addOnce(() => {
                this.canMove = true;
                this.lastTile = this.nextTile;
                this.updateMovementState();
            });
            this.movementTween.start();

            this.updateAnimation();
        }*/
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
            if (this.disableInput) {
                return;
            }
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
            this.movingDirection = direction;
            if (direction != null) {
                this.handleMovement(direction);
            }
            else {
                this.moving = false;
                this.canMove = true;
                if (!this.inFiringMotion) {
                    this.action = KGAD.Actions.Standing;
                }
                if (this.chargeDirection != null) {
                    this.direction = this.chargeDirection;
                }
                this.updateAnimation();
            }
        };
        Hero.prototype.inflictDamage = function (amount, source) {
            _super.prototype.inflictDamage.call(this, amount, source);
            if (this.health <= 0) {
                if (this.weapon.chargeSprite) {
                    this.weapon.cancelCharging();
                    this.weapon.chargeSprite.visible = false;
                    this.weapon.chargeSprite.kill();
                }
            }
            return this;
        };
        Hero.prototype.showDeathAnimation = function () {
            if (this.weapon.chargeSprite) {
                this.weapon.chargeSprite.visible = false;
            }
            _super.prototype.showDeathAnimation.call(this, function () {
            });
        };
        Hero.prototype.preUpdate = function () {
            if (this.moving) {
                if (this.lastChargingState !== this.weapon.isCharging()) {
                    this.lastChargingState = this.weapon.isCharging();
                }
                var angle = KGAD.MovementHelper.getAngleFromDirection(this.movingDirection);
                var deltaTime = this.game.time.physicsElapsed;
                var movementSpeed = this.weapon.isCharging() ? this.movementSpeed / 2.5 : this.movementSpeed;
                var x = Math.cos(angle) * deltaTime * movementSpeed;
                var y = Math.sin(angle) * deltaTime * movementSpeed;
                var nextPosition = new Phaser.Point(this.x + x, this.y + y);
                if (KGAD.OccupiedGrid.canOccupyInPixels(this, nextPosition)) {
                    this.position.set(nextPosition.x, nextPosition.y);
                }
            }
            _super.prototype.preUpdate.call(this);
        };
        Hero.prototype.update = function () {
            _super.prototype.update.call(this);
            if (!this.disableInput) {
                this.checkGamepadDpadForFirefox();
                if (!this.inFiringMotion) {
                    if (this.isFireKeyDown()) {
                        this.fireKeyDown();
                    }
                }
                else {
                    if (this.isFireKeyUp()) {
                        this.fireKeyUp();
                    }
                }
            }
            this.updateCurrentAction();
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
            this.health = 25;
        }
        King.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.hasHealthBar = true;
        };
        King.prototype.addToWorld = function () {
            _super.prototype.addToWorld.call(this);
            this.hasShadow = true;
        };
        Object.defineProperty(King.prototype, "weight", {
            get: function () {
                return 4;
            },
            enumerable: true,
            configurable: true
        });
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
            this.health = 1;
            this.engageRange = 128;
        }
        Mercenary.prototype.init = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            _super.prototype.init.call(this, args);
            this.hasHealthBar = true;
            this.weapon = new KGAD.Weapon(this.game, 'basic_arrow', {
                cooldown: 1500,
                range: 36,
                backSwing: 500,
                power: 1,
            });
            this.threatTable = new KGAD.ThreatTable(this);
            this.threatTable.highestThreatChanged.add(function (sprite) {
                _this.onHighestThreatTargetChanged(sprite);
            });
            KGAD.AnimationLoader.addAnimationToSprite(this, this.key);
            this.blocked.add(this.onBlocked, this);
        };
        Mercenary.prototype.addToWorld = function (force) {
            if (force === void 0) { force = false; }
            if (this.canPerch) {
                force = true;
            }
            _super.prototype.addToWorld.call(this, force);
            this.hasShadow = true;
            this.startingPoint = this.map.toPixels(this.map.fromPixels(this.x, this.y)).add(16, 16);
            this.startingDirection = this.direction;
            KGAD.OccupiedGrid.add(this);
        };
        Mercenary.prototype.onBlocked = function (occupants) {
            var hasEnemies = false;
            var tilePositions = [];
            for (var i = 0, l = occupants.length; i < l; ++i) {
                var occupant = occupants[i];
                tilePositions.push(this.map.fromPixels(occupant.position));
                if (occupant.alliance !== this.alliance) {
                    this.threatTable.addThreat(occupant, 5);
                    hasEnemies = true;
                }
            }
            this.unsetCurrentPath();
            if (this.currentTarget == null) {
                this.currentTarget = this.threatTable.getHighestThreatTarget();
                if (this.currentTarget == null) {
                    this.goHome(tilePositions);
                }
            }
        };
        Mercenary.prototype.checkThreatAgainst = function (enemy) {
            var distance = Phaser.Point.distance(this.startingPoint, enemy);
            if (distance > this.engageRange) {
                return;
            }
            if (distance <= this.engageRange) {
                var threat = (Math.max(1, (this.engageRange - distance)) / this.engageRange) * 0.075;
                this.threatTable.addThreat(enemy, threat);
            }
            else {
                this.threatTable.addThreat(enemy, -0.1);
            }
        };
        Object.defineProperty(Mercenary.prototype, "weight", {
            get: function () {
                if (this.action === KGAD.Actions.Firing) {
                    return 0;
                }
                else if (this.action === KGAD.Actions.Standing) {
                    return 5;
                }
                else if (this.action === KGAD.Actions.Dead || this.action === KGAD.Actions.Dying) {
                    return 1;
                }
                return 2;
            },
            enumerable: true,
            configurable: true
        });
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
                if (this.shadowSprite) {
                    this.shadowSprite.kill();
                    this.hasShadow = false;
                }
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
                _super.prototype.showDeathAnimation.call(this);
                this.game.time.events.add(1000, function () {
                    if (_this.alive) {
                        onAnimationComplete();
                    }
                }, this);
            }
            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }
            this.damageTween = KGAD.AnimationHelper.createDamageTween(this);
            this.damageTween.start();
            return this;
        };
        Mercenary.prototype.update = function () {
            _super.prototype.update.call(this);
            var dead = !this.alive || !this.exists || this.health <= 0;
            if (dead || this.weapon.isBackSwinging()) {
                return;
            }
            this.threatTable.update();
            if (this.currentTarget != null && !this.isMoveTweening() && !this.weapon.isBackSwinging() && !this.weapon.isFrontSwinging()) {
                if (this.inRangeOfTarget()) {
                    this.unsetCurrentPath();
                    this.attackTarget();
                    if (this.currentTarget.health <= 0) {
                        this.threatTable.removeThreatTarget(this.currentTarget);
                        this.currentTarget = this.threatTable.getHighestThreatTarget();
                        if (this.currentTarget == null) {
                            this.goHome();
                        }
                    }
                }
                else if (this.canMove) {
                    this.moveTowardsTarget();
                }
            }
            if (this.currentTarget == null && !this._pathing) {
                this.action = KGAD.Actions.Standing;
                this.updateAnimation();
                this.currentTarget = this.threatTable.getHighestThreatTarget();
            }
        };
        Mercenary.prototype.onHighestThreatTargetChanged = function (sprite) {
            this.currentTarget = sprite;
            this.unsetCurrentPath();
            if (this.currentTarget == null) {
                this.goHome();
            }
        };
        Mercenary.prototype.centerOnTile = function (onComplete) {
            var centerX = Math.floor(this.x / KGAD.OccupiedGrid.NODE_SIZE) * KGAD.OccupiedGrid.NODE_SIZE + KGAD.OccupiedGrid.NODE_SIZE;
            var centerY = Math.floor(this.y / KGAD.OccupiedGrid.NODE_SIZE) * KGAD.OccupiedGrid.NODE_SIZE + KGAD.OccupiedGrid.NODE_SIZE;
            var distance = Phaser.Point.distance(this.position, new Phaser.Point(centerX, centerY));
            var timeToMove = (distance / this.movementSpeed) * 1000.0;
            var angle = this.game.physics.arcade.angleBetween(this.position, new Phaser.Point(centerX, centerY));
            this.face(KGAD.MovementHelper.getDirectionFromAngle(angle));
            var tween = this.game.add.tween(this).to({ x: centerX, y: centerY }, timeToMove, Phaser.Easing.Linear.None, false);
            tween.onComplete.addOnce(function () {
                if (onComplete) {
                    onComplete();
                }
            });
            tween.start();
        };
        Mercenary.prototype.goHome = function (avoid) {
            var _this = this;
            if (avoid === void 0) { avoid = []; }
            var homePoint = this.startingPoint;
            var onComplete = function () {
                _this.action = KGAD.Actions.Standing;
                _this.face(_this.startingDirection);
            };
            var customPositions = [];
            for (var i = 0, l = avoid.length; i < l; ++i) {
                var avoidPos = avoid[i];
                customPositions.push(new KGAD.CustomPathfindingGridNode(avoidPos.x, avoidPos.y, 0));
            }
            if (!this.pathfindTo(homePoint, null, onComplete, customPositions)) {
                this.centerOnTile(onComplete);
            }
        };
        Mercenary.prototype.moveTowardsTarget = function () {
            if (!this.alive || this.isMoveTweening()) {
                return;
            }
            this.pathfindTo(this.currentTarget.position, null, function () {
            });
        };
        Mercenary.prototype.inRangeOfTarget = function () {
            var distance = Phaser.Point.distance(this, this.currentTarget);
            if (distance <= this.weapon.range) {
                return true;
            }
            return false;
        };
        Mercenary.prototype.attackTarget = function () {
            if (!this.weapon.canFire) {
                return;
            }
            this.action = KGAD.Actions.Firing;
            this.face(this.currentTarget);
            var distance = Phaser.Point.distance(this, this.currentTarget);
            if (distance <= this.weapon.range) {
                this.weapon.lastFireTime = this.game.time.now;
                if (this.isRanged) {
                    var angle = this.game.physics.arcade.angleBetween(this, this.currentTarget);
                    var projectiles = KGAD.Game.Projectiles;
                    projectiles.fire(this.x, this.y, this, this.weapon, 0, angle, this.canPerch);
                }
                else {
                    this.currentTarget.inflictDamage(this.weapon.power, this);
                }
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
        ProjectileManager.prototype.getActiveProjectilesThatCantPassThroughWalls = function () {
            var firedProjectiles = [];
            for (var i = 0, l = this.activeProjectiles.length; i < l; ++i) {
                var active = this.activeProjectiles[i];
                if (!active.goThroughWalls) {
                    firedProjectiles.push(active);
                }
            }
            return firedProjectiles;
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
        ProjectileManager.prototype.fire = function (x, y, who, weapon, chargePower, angle, goThroughWalls, onKill) {
            var _this = this;
            if (goThroughWalls === void 0) { goThroughWalls = false; }
            var game = KGAD.Game.Instance;
            var map = KGAD.Game.CurrentMap;
            var direction = who.direction;
            var p = KGAD.MovementHelper.getPointFromDirection(direction);
            var projectileStartPosition = Phaser.Point.add(who.position, p);
            var group = this.getGroupByType(weapon.key);
            var rotation = angle || KGAD.MovementHelper.getAngleFromDirection(direction);
            var sprite = group.create(x, y, weapon.key);
            if (weapon.deadProjectileKey) {
                sprite.deadSpriteKey = weapon.deadProjectileKey;
            }
            sprite.lifespan = weapon.aliveTime;
            sprite.rotation = rotation;
            sprite.direction = direction;
            sprite.renderPriority = -1;
            sprite.goThroughWalls = goThroughWalls;
            sprite.init(weapon, who, chargePower);
            sprite.body.rotation = sprite.rotation;
            sprite.body.width = sprite.body.width - 1;
            sprite.body.height = sprite.body.height - 1;
            game.physics.arcade.velocityFromAngle(sprite.angle, sprite.speed, sprite.body.velocity);
            var distX = sprite.body.velocity.x * (weapon.aliveTime / 1000);
            var distY = sprite.body.velocity.y * (weapon.aliveTime / 1000);
            var ray = new Phaser.Line(sprite.x, sprite.y, sprite.x + distX, sprite.y + distY);
            ray.end.x = Phaser.Math.clamp(ray.end.x, 0, map.widthInPixels);
            ray.end.y = Phaser.Math.clamp(ray.end.y, 0, map.heightInPixels);
            var pixelPoint = new Phaser.Point();
            var tile = KGAD.CollisionHelper.raycastFirstTile(ray, 4, pixelPoint);
            var aliveTime = weapon.aliveTime;
            if (!goThroughWalls && tile) {
                aliveTime = (Phaser.Point.distance(sprite.position, pixelPoint) / sprite.speed) * 1000;
                sprite.hitWallPoint = pixelPoint;
            }
            sprite.aliveTime = aliveTime;
            game.time.events.add(aliveTime, function () {
                _this.makeInactive(sprite);
            }, this);
            this.activeProjectiles.push(sprite);
        };
        ProjectileManager.prototype.update = function () {
            var _this = this;
            var game = KGAD.Game.Instance;
            game.physics.arcade.collide(this.getActiveProjectilesThatCantPassThroughWalls(), KGAD.Game.CurrentMap.collisionLayer, function (proj) {
                _this.onProjectileHitWall(proj);
            });
            /*game.physics.arcade.overlap(this.activeProjectiles, Game.CurrentMap.collisionLayer,(proj) => {
                this.onProjectileHitWall(proj);
            });*/
            /*for (var i = 0, l = this.activeProjectiles.length; i < l; ++i) {
                this.activeProjectiles[i].update();
            }

            for (i = 0, l = this.inactiveProjectiles.length; i < l; ++i) {
                this.inactiveProjectiles[i].update();
            }*/
        };
        ProjectileManager.prototype.render = function () {
            /*if (this.debugLastRay) {
                Game.Instance.debug.geom(this.debugLastRay);
                Game.Instance.debug.geom(this.debugFirstTile, '#FF9999', true);
            }*/
        };
        ProjectileManager.prototype.onProjectileHitWall = function (proj) {
            proj.hitWall();
            this.makeInactive(proj);
        };
        return ProjectileManager;
    })();
    KGAD.ProjectileManager = ProjectileManager;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var GameControllerActivator = (function () {
        function GameControllerActivator(typ) {
            this.typ = typ;
        }
        GameControllerActivator.prototype.getNew = function (children) {
            return new this.typ(children);
        };
        return GameControllerActivator;
    })();
    KGAD.GameControllerActivator = GameControllerActivator;
    var GameController = (function () {
        function GameController(children, parent) {
            if (children === void 0) { children = []; }
            this.children = children;
            this.parent = parent;
        }
        Object.defineProperty(GameController, "current", {
            get: function () {
                return this._current;
            },
            set: function (controller) {
                if (this._current) {
                    this._current.destroy();
                }
                if (controller) {
                    controller.init(KGAD.Game.Context);
                    controller.create();
                }
                this._current = controller;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "done", {
            get: function () {
                return this.context['gameComplete'];
            },
            set: function (_done) {
                this.context['gameComplete'] = _done;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "actors", {
            get: function () {
                return this.context['actors'];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "script", {
            get: function () {
                return this.context['script'];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "hero", {
            get: function () {
                return this.context['actors'].hero;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "king", {
            get: function () {
                return this.context['actors'].king;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "mercenaries", {
            get: function () {
                return this.actors.mercenaries;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "enemies", {
            get: function () {
                return this.actors.enemies;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "game", {
            get: function () {
                return KGAD.Game.Instance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "map", {
            get: function () {
                return KGAD.Game.CurrentMap;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "world", {
            get: function () {
                return this.game.world;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "camera", {
            get: function () {
                return this.game.camera;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "skillChallengeMode", {
            get: function () {
                return !!this.context['skillChallengeMode'];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "projectiles", {
            get: function () {
                return this.context['projectiles'];
            },
            enumerable: true,
            configurable: true
        });
        GameController.prototype.init = function (context) {
            this.context = context;
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].init(context);
            }
        };
        GameController.prototype.preload = function () {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].preload();
            }
        };
        GameController.prototype.create = function () {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].create();
            }
        };
        GameController.prototype.update = function () {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].update();
            }
        };
        GameController.prototype.render = function () {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].render();
            }
        };
        GameController.prototype.destroy = function () {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].destroy();
            }
        };
        GameController.switchTo = function (name) {
            if (GameController._controllers.containsKey(name)) {
                var controller = GameController._controllers.getValue(name);
                GameController.current = controller;
            }
        };
        GameController.createController = function (name, typ, children) {
            if (children === void 0) { children = []; }
            var controller = new GameControllerActivator(typ).getNew(children);
            for (var i = 0, l = children.length; i < l; ++i) {
                children[i].parent = controller;
            }
            GameController._controllers.setValue(name, controller);
            return controller;
        };
        GameController.preload = function () {
            GameController._controllers.forEach(function (key, value) {
                value.preload();
            });
            KGAD.Game.Instance.load.start();
        };
        GameController.destroyControllers = function (destroy) {
            if (destroy === void 0) { destroy = true; }
            if (destroy) {
                GameController._controllers.forEach(function (key, value) {
                    value.destroy();
                });
            }
            GameController._controllers.clear();
            GameController.current = null;
        };
        GameController._current = null;
        GameController._controllers = new collections.Dictionary();
        return GameController;
    })();
    KGAD.GameController = GameController;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var PrepareDefenseController = (function (_super) {
        __extends(PrepareDefenseController, _super);
        function PrepareDefenseController(children, parent) {
            _super.call(this, children, parent);
            this.purchaseMenu = new KGAD.PurchaseMenu([], this);
            this.children.push(this.purchaseMenu);
        }
        PrepareDefenseController.prototype.init = function (context) {
            var _this = this;
            _super.prototype.init.call(this, context);
            var spawnPoint = this.map.toPixels(this.map.heroSpawnPoint);
            this.hero.pathfindTo(spawnPoint, null, function () {
                _this.hero.face(2 /* Down */);
            });
            KGAD.Input.disablePlayerInput(this.hero);
        };
        PrepareDefenseController.prototype.preload = function () {
            _super.prototype.preload.call(this);
        };
        PrepareDefenseController.prototype.create = function () {
            var _this = this;
            _super.prototype.create.call(this);
            KGAD.AnimationHelper.createTextPopup("PREPARE YOUR DEFENSE");
            //AnimationHelper.createTextSubPopup("THIS IS ONLY A PLACEHOLDER FOR NOW");
            var spawnPoint = this.map.toPixels(this.map.heroSpawnPoint).add(16, 16);
            var invisSprite = this.game.add.sprite(this.hero.x, this.hero.y);
            invisSprite.visible = false;
            this.camera.follow(invisSprite);
            var moveToCenter = this.game.add.tween(invisSprite).to({ x: spawnPoint.x, y: spawnPoint.y }, 1000, Phaser.Easing.Linear.None, false, 500);
            moveToCenter.onComplete.addOnce(function () {
                _this.camera.unfollow();
                invisSprite.kill();
            });
            moveToCenter.start();
            /*this.game.time.events.add(5000,() => {
                this.switchTo('SimulationController');
            }, this);*/
        };
        PrepareDefenseController.prototype.update = function () {
            _super.prototype.update.call(this);
            var Key = Phaser.Keyboard;
            if (this.game.input.keyboard.isDown(Key.LEFT)) {
                this.game.camera.x -= 125 * this.game.time.physicsElapsed;
            }
            else if (this.game.input.keyboard.isDown(Key.RIGHT)) {
                this.game.camera.x += 125 * this.game.time.physicsElapsed;
            }
            if (this.game.input.keyboard.isDown(Key.UP)) {
                this.game.camera.y -= 125 * this.game.time.physicsElapsed;
            }
            else if (this.game.input.keyboard.isDown(Key.DOWN)) {
                this.game.camera.y += 125 * this.game.time.physicsElapsed;
            }
            if (this.purchaseMenu.ready) {
                KGAD.GameController.switchTo('SimulationController');
            }
        };
        PrepareDefenseController.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            //Input.enablePlayerInput(this.hero);
        };
        return PrepareDefenseController;
    })(KGAD.GameController);
    KGAD.PrepareDefenseController = PrepareDefenseController;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var SimulationController = (function (_super) {
        __extends(SimulationController, _super);
        function SimulationController() {
            _super.apply(this, arguments);
        }
        SimulationController.prototype.init = function (context) {
            _super.prototype.init.call(this, context);
            this.waveInProgress = false;
            this.debugMode = false;
            this.shownFailureAnimation = false;
        };
        SimulationController.prototype.preload = function () {
            _super.prototype.preload.call(this);
        };
        SimulationController.prototype.create = function () {
            var _this = this;
            _super.prototype.create.call(this);
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
                moveToCenter.onComplete.addOnce(function () {
                    _this.camera.unfollow();
                    invisSprite.kill();
                    _this.camera.follow(_this.hero, Phaser.Camera.FOLLOW_LOCKON);
                    _this.camera.setBoundsToWorld();
                    _this.camera.roundPx = true;
                    KGAD.Input.enablePlayerInput(_this.hero);
                });
                moveToCenter.start();
                this.camera.follow(invisSprite);
            }
            this.waveInProgress = !!this.script.nextWave(function (enemyType, position) {
                if (_this.done) {
                    return;
                }
                if (!position) {
                    position = _this.actors.peekNextSpawnPoint();
                }
                var spawnCounter = 0;
                var trySpawn = null;
                trySpawn = function () {
                    var rect = new Phaser.Rectangle(position.x - 16, position.y - 16, 32, 32);
                    var occupants = KGAD.OccupiedGrid.getOccupantsInBounds(rect);
                    if (occupants.length === 0) {
                        //console.log('[' + (++spawnCounter).toString() + '] spawn ' + enemyType + ' at (' + position.x + ', ' + position.y + ')');
                        var enemy = _this.actors.createEnemy(enemyType);
                        if (_this.skillChallengeMode) {
                            enemy.health = 999999999;
                        }
                    }
                    else {
                        _this.game.time.events.add(250, function () {
                            trySpawn();
                        }, _this);
                    }
                };
                trySpawn();
            });
            if (!this.waveInProgress) {
                KGAD.AnimationHelper.createTextPopup("VICTORY!", 250, 7000, function () {
                    _this.done = true;
                });
                return;
            }
            else {
                this.game.time.events.add(500, function () {
                    KGAD.AnimationHelper.createTextPopup("PROTECT THE KING");
                    if (!_this.skillChallengeMode) {
                        KGAD.AnimationHelper.createTextSubPopup("WAVE " + _this.script.waveIndex);
                    }
                }, this);
                this.antistuckRunning = false;
            }
            this.game.input.keyboard.addKey(Phaser.Keyboard.TILDE).onUp.add(function () {
                _this.debugMode = !_this.debugMode;
            });
            if (!this.goldBar && !this.skillChallengeMode) {
                this.goldBar = this.game.add.sprite(0, 0, 'gold_bar');
                this.goldBar.fixedToCamera = true;
                this.goldBar.renderPriority = 99;
                this.goldBarText = KGAD.Text.createText(this.hero.gold.toString(), {
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
                this.goldBarTextSprite.renderPriority = 100;
                this.goldBarTextSprite.fixedToCamera = true;
                this.goldBarTextSprite.cameraOffset.x = 20;
                this.goldBarTextSprite.cameraOffset.y = 2;
                this.goldBarTextSprite['update'] = function () {
                    _this.goldBarText.text = _this.hero.gold.toString();
                };
            }
        };
        SimulationController.prototype.update = function () {
            var _this = this;
            _super.prototype.update.call(this);
            var projectiles = this.projectiles;
            projectiles.update();
            var physics = this.game.physics.arcade;
            var actors = this.actors;
            physics.collide(projectiles.getActiveProjectiles(), this.actors.enemies, function (first, second) {
                _this.handleProjectileCollision(first, second);
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
                        KGAD.AnimationHelper.createTextPopup("VICTORY!", 250, 7000, function () {
                            _this.done = true;
                        });
                    }
                    else {
                        this.hero.revive(5);
                        KGAD.GameController.switchTo('PrepareDefenseController');
                    }
                    return;
                }
            }
            if (!this.hero.alive) {
                this.game.camera.unfollow();
                this.game.camera.focusOnXY(this.king.x, this.king.y);
            }
            if (!actors.king.alive && !this.skillChallengeMode && !this.shownFailureAnimation) {
                this.showFailureAnimation();
            }
            this.runAntistuck();
        };
        SimulationController.prototype.render = function () {
            _super.prototype.render.call(this);
            if (this.debugMode) {
            }
        };
        SimulationController.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        SimulationController.prototype.runAntistuck = function () {
            if (!this.waveInProgress) {
                return;
            }
            for (var i = 0, l = this.enemies.length; i < l; ++i) {
                var enemy = this.enemies[i];
                if (enemy.health >= 0) {
                    var indices = KGAD.OccupiedGrid.getIndicesOfSprite(enemy, true);
                    if ($.inArray(-1, indices) >= 0) {
                        var enem = enemy;
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
        };
        /**
         *  Show the user an animation indicating that the user has lost.
         */
        SimulationController.prototype.showFailureAnimation = function () {
            var _this = this;
            this.shownFailureAnimation = true;
            this.game.time.events.add(1000, function () {
                var failure = _this.game.add.text(0, 0, 'YOU LOSE', {
                    font: '36px MedievalSharpBook',
                    align: 'center',
                    fill: '#FFFFFF'
                });
                var failureSprite = _this.game.make.sprite(_this.camera.width / 2 - failure.width / 2, _this.camera.height / 2 - failure.height / 2);
                failureSprite.addChild(failure);
                failureSprite.fixedToCamera = true;
                failureSprite.alpha = 0;
                failureSprite.anchor.setTo(0.5);
                failureSprite['renderPriority'] = 9999;
                failureSprite.bringToTop();
                _this.game.world.add(failureSprite);
                var tween = _this.game.add.tween(failureSprite).to({ alpha: 1 }, 1000);
                tween.start();
                var fadeSprite = _this.game.make.sprite(0, 0, 'black');
                fadeSprite.renderPriority = 9999;
                fadeSprite.width = _this.camera.view.width;
                fadeSprite.height = _this.camera.view.height;
                fadeSprite.fixedToCamera = true;
                fadeSprite.alpha = 0;
                _this.game.world.add(fadeSprite);
                var fadeTween = _this.game.add.tween(fadeSprite).to({ alpha: 1 }, 4000);
                fadeTween.onComplete.addOnce(function () {
                    _this.game.time.events.add(2000, function () {
                        var finalTween = _this.game.add.tween(failureSprite).to({ alpha: 0 }, 1000);
                        finalTween.onComplete.addOnce(function () {
                            _this.game.time.events.add(1500, function () {
                                _this.done = true;
                            }, _this);
                        });
                        finalTween.start();
                    }, _this);
                });
                fadeTween.start();
                fadeSprite.bringToTop();
                failureSprite.bringToTop();
            }, this);
        };
        /**
         *  Determine what to do when the user clicks.
         */
        SimulationController.prototype.handleMouseClicked = function (x, y) {
            if (this.skillChallengeMode) {
                return;
            }
            var tile = this.map.fromPixels(new Phaser.Point(x, y));
            var position = this.map.toPixels(tile).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            var mercType = this.game.cache.getJSON("mercenary_longbowman");
            if (KGAD.OccupiedGrid.canOccupyInPixels(null, position.x, position.y)) {
                this.actors.createMercenary(position.x, position.y, mercType);
            }
        };
        /**
         *  Handle the case that a projectile has collided with an enemy.
         */
        SimulationController.prototype.handleProjectileCollision = function (projectile, sprite) {
            if (projectile.dead) {
                return;
            }
            projectile.attachTo(sprite);
            sprite.inflictDamage(projectile.power, projectile.firedBy);
        };
        return SimulationController;
    })(KGAD.GameController);
    KGAD.SimulationController = SimulationController;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var SkillChallengeController = (function (_super) {
        __extends(SkillChallengeController, _super);
        function SkillChallengeController() {
            _super.apply(this, arguments);
        }
        SkillChallengeController.prototype.init = function (context) {
            _super.prototype.init.call(this, context);
            this.shownFailureAnimation = false;
            this.shownVictoryAnimation = false;
        };
        SkillChallengeController.prototype.create = function () {
            _super.prototype.create.call(this);
            if (!this.skillChallengeMode) {
                return;
            }
            this.failedSkillChallenge = false;
            this.skillChallengeStartTime = this.game.time.now;
            this.skillChallengeEndTime = this.skillChallengeStartTime + 180000; // 3mins
            var timeLeft = this.skillChallengeEndTime - this.skillChallengeStartTime;
            this.skillChallengeTimer = this.game.add.text(0, 0, 'Time left: ' + this.formatTime(timeLeft), {
                font: '16px MedievalSharpBook',
                align: 'left',
                fill: '#FFFFFF',
            });
            this.skillChallengeTimer.fixedToCamera = true;
            this.hero.weapon.power = 1000;
        };
        SkillChallengeController.prototype.update = function () {
            _super.prototype.update.call(this);
            if (!this.skillChallengeMode) {
                return;
            }
            // If the player or king dies, they've failed the challenge.
            if (!this.hero.alive || !this.king.alive) {
                this.failedSkillChallenge = true;
            }
            // If the king isn't alive, show the player the "FAILURE" animation (if we haven't already).
            if (!this.king.alive && !this.shownFailureAnimation) {
                this.showFailureAnimation();
            }
            this.updateSkillTimer();
        };
        /**
         *  Updates the timer, which is counting down until the player wins.
         */
        SkillChallengeController.prototype.updateSkillTimer = function () {
            this.skillChallengeStartTime += this.game.time.elapsedMS;
            var timeLeftMs = this.skillChallengeEndTime - this.skillChallengeStartTime;
            if (timeLeftMs <= 0) {
                if (timeLeftMs <= 0 && !this.failedSkillChallenge && !this.shownVictoryAnimation) {
                    this.showVictoryAnimation();
                }
            }
            else if (!this.failedSkillChallenge) {
                var timeLeft = this.formatTime(timeLeftMs);
                this.skillChallengeTimer.text = 'Time left: ' + timeLeft;
                if (timeLeftMs < 10000) {
                    this.skillChallengeTimer.tint = 0xFF7777;
                }
                if (!this.actors.hero.alive || !this.actors.king.alive) {
                    this.failedSkillChallenge = true;
                }
            }
        };
        /**
         *  Show the user an animation indicating that he has won.
         */
        SkillChallengeController.prototype.showVictoryAnimation = function () {
            var _this = this;
            this.shownVictoryAnimation = true;
            this.actors.hero.health = 999;
            this.actors.king.health = 999;
            var enemies = this.actors.enemies;
            var killEnemy = null;
            killEnemy = function () {
                if (enemies.length > 0) {
                    var enemy = enemies.pop();
                    enemy.inflictDamage(9999999999, _this.actors.hero);
                    _this.game.time.events.add(100, killEnemy, _this);
                }
                else {
                    _this.game.time.events.add(15000, function () {
                        _this.done = true;
                    }, _this);
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
            }, 250, Phaser.Easing.Cubic.InOut, true, 0, 999, true);
            killEnemy();
        };
        /**
         *  Show the user an animation indicating that the user has lost.
         */
        SkillChallengeController.prototype.showFailureAnimation = function () {
            var _this = this;
            this.shownFailureAnimation = true;
            this.game.time.events.add(1000, function () {
                var failure = _this.game.add.text(0, 0, 'YOU ARE A FAILURE', {
                    font: '36px MedievalSharpBook',
                    align: 'center',
                    fill: '#FFFFFF'
                });
                var failureSprite = _this.game.make.sprite(_this.camera.width / 2 - failure.width / 2, _this.camera.height / 2 - failure.height / 2);
                failureSprite.addChild(failure);
                failureSprite.fixedToCamera = true;
                failureSprite.alpha = 0;
                failureSprite.anchor.setTo(0.5);
                failureSprite['renderPriority'] = 9999;
                failureSprite.bringToTop();
                _this.game.world.add(failureSprite);
                var tween = _this.game.add.tween(failureSprite).to({ alpha: 1 }, 1000);
                tween.start();
                var fadeSprite = _this.game.make.sprite(0, 0, 'black');
                fadeSprite.renderPriority = 9999;
                fadeSprite.width = _this.camera.view.width;
                fadeSprite.height = _this.camera.view.height;
                fadeSprite.fixedToCamera = true;
                fadeSprite.alpha = 0;
                _this.game.world.add(fadeSprite);
                var fadeTween = _this.game.add.tween(fadeSprite).to({ alpha: 1 }, 4000);
                fadeTween.onComplete.addOnce(function () {
                    _this.game.time.events.add(2000, function () {
                        var finalTween = _this.game.add.tween(failureSprite).to({ alpha: 0 }, 1000);
                        finalTween.onComplete.addOnce(function () {
                            _this.game.time.events.add(1500, function () {
                                _this.done = true;
                            }, _this);
                        });
                        finalTween.start();
                    }, _this);
                });
                fadeTween.start();
                fadeSprite.bringToTop();
                failureSprite.bringToTop();
            }, this);
        };
        /**
         *  Format a minutes/seconds timestamp as "M:SS".
         */
        SkillChallengeController.prototype.formatTime = function (timeMs) {
            var date = new Date(timeMs);
            return this.pad(date.getMinutes(), 1, '0') + ':' + this.pad(date.getSeconds(), 2, '0');
        };
        /**
         *  Pad a string out to 'width' characters, filling in the blanks with 'z'.
         */
        SkillChallengeController.prototype.pad = function (n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        };
        return SkillChallengeController;
    })(KGAD.GameController);
    KGAD.SkillChallengeController = SkillChallengeController;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var ScriptEngine = (function () {
        function ScriptEngine(level) {
            this.game = KGAD.Game.Instance;
            this.map = KGAD.Game.CurrentMap;
            this._level = level;
            this._enemyKeys = [];
            this._waveIndex = 0;
            this._waveInProgress = false;
        }
        Object.defineProperty(ScriptEngine.prototype, "waveIndex", {
            /**
             *  Gets the wave index.
             */
            get: function () {
                return this._waveIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScriptEngine.prototype, "waveInProgress", {
            /**
             *  Gets whether or not there is a wave currently operating.
             */
            get: function () {
                return this._waveInProgress;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Preloads the script engine data.
         */
        ScriptEngine.prototype.preload = function (level) {
            this._level = level || this._level;
            this.game.load.json('scripts', 'assets/maps/scripts.json');
        };
        /**
         *  Creates the script engine data from the preloaded JSON script.
         */
        ScriptEngine.prototype.create = function (level) {
            this._level = level || this._level;
            if (!this._level) {
                throw new Error("No level specified!");
            }
            var json = this.game.cache.getJSON('scripts');
            if (!json.scripts) {
                throw new Error("No 'scripts' element in JSON: " + JSON.stringify(json, null, 2));
            }
            var scripts = json.scripts;
            var script = scripts[this._level];
            if (!script) {
                throw new Error("Level not found in script engine: " + this._level);
            }
            this._script = this.fillDefaults(script);
            this._waveIndex = 0;
            console.log('script created for level ' + this._level);
        };
        /**
         *  Gets all enemy keys, which can be useful for loading sprite assets.
         */
        ScriptEngine.prototype.getEnemyKeys = function () {
            return this._enemyKeys;
        };
        /**
         *  Gets whether or not there is a next wave that can be invoked via nextWave().
         */
        ScriptEngine.prototype.hasNextWave = function () {
            return this._waveIndex < this._script.waves.length;
        };
        /**
         *  Starts the next wave. If the next wave cannot be started or a wave is already running, this method
         *  does nothing and returns false. If the wave starts successfully, true is returned.
         */
        ScriptEngine.prototype.nextWave = function (enemySpawner) {
            var _this = this;
            if (this._waveInProgress || !this.hasNextWave()) {
                return false;
            }
            this._waveInProgress = true;
            var wave = this._script.waves[this._waveIndex++];
            if (!wave) {
                return false;
            }
            var timer = this.game.time.events;
            var availableEnemyTypes = [];
            var enemyTypeIdx = 0;
            var totalDelay = 0;
            var getNextEnemyType = function () {
                var len = availableEnemyTypes.length;
                if (len === 0) {
                    return null;
                }
                else if (enemyTypeIdx >= len) {
                    enemyTypeIdx = 0;
                }
                return availableEnemyTypes[enemyTypeIdx++];
            };
            var spawnEnemy = null;
            spawnEnemy = function () {
                var nextEnemyType = getNextEnemyType();
                if (!nextEnemyType) {
                    _this.stopWave();
                    return;
                }
                var point = null;
                if (seq.spawnPointName) {
                }
                enemySpawner(nextEnemyType, point);
            };
            var table = [];
            for (var i = 0, l = wave.sequence.length; i < l; ++i) {
                var seq = wave.sequence[i];
                var times = seq.times;
                var every = seq.every;
                table.push({
                    delay: seq.delay
                });
                this.addEnemyTypes(seq.addEnemyTypes, availableEnemyTypes);
                this.removeEnemyTypes(seq.removeEnemyTypes, availableEnemyTypes);
                for (var j = 0; j < times; ++j) {
                    var position = null;
                    if (seq.spawnPointName) {
                    }
                    table.push({
                        delay: every,
                        enemyType: getNextEnemyType(),
                        position: position
                    });
                }
            }
            for (i = 0, l = table.length; i < l; ++i) {
                var entry = table[i];
                totalDelay += entry.delay;
                timer.add(totalDelay, spawnEnemy, this);
            }
            timer.add(totalDelay, function () {
                _this.stopWave();
            }, this);
            return true;
        };
        /**
         *  Stops the current wave.
         */
        ScriptEngine.prototype.stopWave = function () {
            this._waveInProgress = false;
        };
        /**
         *  Add enemy types to the given list of available types.
         */
        ScriptEngine.prototype.addEnemyTypes = function (types, availableTypes) {
            for (var j = 0, m = types.length; j < m; ++j) {
                var enemyType = types[j];
                var priority = enemyType.priority;
                while (priority > 0) {
                    availableTypes.push(enemyType.key);
                    --priority;
                }
            }
        };
        /**
         *  Remove enemy types from the given list of available types.
         */
        ScriptEngine.prototype.removeEnemyTypes = function (types, availableTypes) {
            for (var j = 0, m = types.length; j < m; ++j) {
                var key = types[j];
                var idx = -1;
                while ((idx = $.inArray(key, availableTypes)) !== -1) {
                    availableTypes.splice(idx, 1);
                }
            }
        };
        /**
         *  Validate the script internals and set default values for missing data.
         */
        ScriptEngine.prototype.fillDefaults = function (script) {
            var waves = script.waves || [];
            for (var i = 0, l = waves.length; i < l; ++i) {
                var wave = waves[i];
                wave.delay = wave.delay || 0;
                var sequence = wave.sequence || [];
                for (var j = 0, m = sequence.length; j < m; ++j) {
                    var entry = sequence[j];
                    entry.addEnemyTypes = entry.addEnemyTypes || [];
                    entry.removeEnemyTypes = entry.removeEnemyTypes || [];
                    entry.boss = !!entry.boss;
                    entry.delay = entry.delay || 0;
                    entry.every = entry.every || 0;
                    entry.times - entry.times || 1;
                    if (entry.times <= 0) {
                        entry.times = 1;
                    }
                    entry.spawnPointName = entry.spawnPointName || null;
                    var remove = [];
                    for (var k = 0, n = entry.addEnemyTypes.length; k < n; ++k) {
                        var enemyType = entry.addEnemyTypes[k];
                        enemyType.priority = enemyType.priority || 1;
                        if (enemyType.priority <= 0) {
                            enemyType.priority = 1;
                        }
                        if (!enemyType.key) {
                            remove.push(enemyType);
                        }
                        else {
                            if ($.inArray(enemyType.key, this._enemyKeys) < 0) {
                                this._enemyKeys.push(enemyType.key);
                                KGAD.AnimationLoader.load(enemyType.key, function (spr) {
                                }, KGAD.Enemy);
                            }
                        }
                    }
                    var idx = -1;
                    for (k = 0, n = remove.length; k < n; ++k) {
                        idx = $.inArray(remove[k], entry.addEnemyTypes);
                        if (idx >= 0) {
                            entry.addEnemyTypes.splice(idx, 1);
                        }
                    }
                    remove = [];
                    for (k = 0, n = entry.removeEnemyTypes.length; k < n; ++k) {
                        var enemyTypeToRemove = entry.removeEnemyTypes[k];
                        if (!enemyTypeToRemove) {
                            remove.push(enemyTypeToRemove);
                        }
                    }
                    idx = -1;
                    for (k = 0, n = remove.length; k < n; ++k) {
                        idx = $.inArray(remove[k], entry.removeEnemyTypes);
                        if (idx >= 0) {
                            entry.removeEnemyTypes.splice(idx, 1);
                        }
                    }
                }
            }
            return script;
        };
        return ScriptEngine;
    })();
    KGAD.ScriptEngine = ScriptEngine;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
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
            this.doTableMaintenance();
        };
        /**
         *  Perform maintenance on the table, such as removing targets who no longer exist.
         */
        ThreatTable.prototype.doTableMaintenance = function () {
            var removables = [];
            var highestThreatSprite = this._highestThreatTarget;
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
            if (removables.length === this._table.length) {
                highestThreatSprite = null;
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
    var Button = (function () {
        function Button(key, x, y, buttonWidth, buttonHeight) {
            this.key = key;
            this.game = KGAD.Game.Instance;
            this.position = new Phaser.Point(x, y);
            this.width = buttonWidth;
            this.height = buttonHeight;
            this.offset = new Phaser.Point();
            this.clicked = new Phaser.Signal();
            this.hoveredOver = new Phaser.Signal();
            this.hoveredOut = new Phaser.Signal();
            this.mousePressed = new Phaser.Signal();
            this.mouseReleased = new Phaser.Signal();
            this.preload();
        }
        Object.defineProperty(Button.prototype, "x", {
            get: function () {
                return this.position.x;
            },
            set: function (_x) {
                this.position.x = _x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "y", {
            get: function () {
                return this.position.y;
            },
            set: function (_y) {
                this.position.y = _y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "offsetX", {
            get: function () {
                return this.offset.x;
            },
            set: function (x) {
                this.offset.x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "offsetY", {
            get: function () {
                return this.offset.y;
            },
            set: function (y) {
                this.offset.y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "disabled", {
            get: function () {
                return this.isDisabled;
            },
            set: function (disabled) {
                if (disabled) {
                    this.button.frame = 3;
                    this.button.setFrames(3, 3, 3, 3);
                }
                else {
                    this.button.setFrames(1, 0, 2, 1);
                }
                this.isDisabled = disabled;
                this.button.inputEnabled = !this.isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.preload = function () {
            var url = 'assets/textures/misc/' + this.key + '.png';
            this.game.load.spritesheet(this.key, url, this.width, this.height);
        };
        Button.prototype.create = function () {
            var overFrame = 1;
            var outFrame = 0;
            var downFrame = 2;
            var upFrame = 1;
            var x = this.x;
            var y = this.y;
            this.button = this.game.add.button(this.x, this.y, this.key, this._onClick, this, overFrame, outFrame, downFrame, upFrame);
            this.button.onInputOver.add(this._onHover, this);
            this.button.onInputOut.add(this._onHoverOut, this);
            this.button.onInputDown.add(this._onMouseDown, this);
            this.button.onInputDown.add(this._onMouseUp, this);
            this.button.fixedToCamera = true;
            this.button.position.set(0, 0);
            this.button.cameraOffset.x = x;
            this.button.cameraOffset.y = y;
        };
        Button.prototype._onClick = function () {
            if (!this.disabled) {
                this.clicked.dispatch(this);
            }
        };
        Button.prototype._onHover = function () {
            if (!this.disabled) {
                this.hoveredOver.dispatch(this);
            }
        };
        Button.prototype._onHoverOut = function () {
            if (!this.disabled) {
                this.hoveredOut.dispatch(this);
            }
        };
        Button.prototype._onMouseDown = function () {
            if (!this.disabled) {
                this.mousePressed.dispatch(this);
            }
        };
        Button.prototype._onMouseUp = function () {
            if (!this.disabled) {
                this.mouseReleased.dispatch(this);
            }
        };
        return Button;
    })();
    KGAD.Button = Button;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var ButtonGroup = (function (_super) {
        __extends(ButtonGroup, _super);
        function ButtonGroup(game, parent, name, addToStage, enableBody, physicsBodyType) {
            _super.call(this, game, parent, name, addToStage, enableBody, physicsBodyType);
            this.buttons = new collections.LinkedList();
            this.clicked = new Phaser.Signal();
            this.fixedToCamera = true;
            this.x = 0;
            this.y = 0;
            this.spacing = 0;
            this.margin = 0;
        }
        Object.defineProperty(ButtonGroup.prototype, "spacing", {
            get: function () {
                return this.spacing;
            },
            set: function (spacing) {
                this.spacing = spacing;
                this.updatePosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonGroup.prototype, "margin", {
            get: function () {
                return this.margin;
            },
            set: function (margin) {
                this.margin = margin;
                this.updatePosition();
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Add several buttons.
         */
        ButtonGroup.prototype.addButtons = function (buttons) {
            for (var i = 0, l = buttons.length; i < l; ++i) {
                this.addButton(buttons[i]);
            }
        };
        /**
         *  Adds a button to the button group.
         */
        ButtonGroup.prototype.addButton = function (button, index) {
            this.addEventHandlers(button);
            this.buttons.add(button, index);
        };
        /**
         *  Removes a button from the button group.
         */
        ButtonGroup.prototype.removeButton = function (button) {
            var removed;
            if (typeof button === 'number') {
                removed = this.buttons.removeElementAtIndex(button);
            }
            else {
                removed = this.buttons.remove(button) ? button : null;
            }
            if (removed) {
                this.removeEventHandlers(removed);
            }
            return removed;
        };
        /**
         *  Enable the player to navigate the button group using the keyboard and gamepad.
         */
        ButtonGroup.prototype.enableKeyboardAndGamepadNavigation = function () {
            var kb = this.game.input.keyboard;
            var gp = this.game.input.gamepad;
            var pad = gp.padsConnected === 0 ? null : gp.pad1.connected ? gp.pad1 : gp.pad2.connected ? gp.pad2 : gp.pad3.connected ? gp.pad3 : gp.pad4.connected ? gp.pad4 : null;
            this.keys[0 /* Up */] = [kb.addKey(Phaser.Keyboard.UP),];
            this.keys[1 /* Left */] = [kb.addKey(Phaser.Keyboard.LEFT),];
            this.keys[3 /* Right */] = [kb.addKey(Phaser.Keyboard.RIGHT),];
            this.keys[2 /* Down */] = [kb.addKey(Phaser.Keyboard.DOWN),];
            if (pad != null) {
                this.keys[0 /* Up */].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_UP));
                this.keys[2 /* Down */].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN));
                this.keys[1 /* Left */].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT));
                this.keys[3 /* Right */].push(pad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT));
            }
        };
        /**
         *  Disable the player to navigate the button group using the keyboard and gamepad.
         */
        ButtonGroup.prototype.disableKeyboardAndGameplayNavigation = function () {
            for (var direction in this.keys) {
                if (this.keys.hasOwnProperty(direction)) {
                    var keyList = this.keys[direction];
                    for (var i = 0, l = keyList.length; i < l; ++i) {
                        var key = keyList[i];
                        if (key instanceof Phaser.Key) {
                            key.enabled = false;
                        }
                        else if (key instanceof Phaser.GamepadButton) {
                            key.destroy();
                        }
                    }
                }
            }
            this.keys = {};
        };
        /**
         *  Adds internal event handlers for the button.
         */
        ButtonGroup.prototype.addEventHandlers = function (button) {
            button.clicked.add(this.onButtonClicked, this);
        };
        /**
         *  Removes internal event handlers for the button.
         */
        ButtonGroup.prototype.removeEventHandlers = function (button) {
            button.clicked.remove(this.onButtonClicked, this);
        };
        /**
         *  Called when a button associated with this group is clicked.
         */
        ButtonGroup.prototype.onButtonClicked = function (button) {
            this.clicked.dispatch(button, this);
        };
        /**
         *  Updates the position of each button in this button group.
         */
        ButtonGroup.prototype.updatePosition = function () {
            var _this = this;
            var len = this.buttons.size();
            var x = this.cameraOffset.x + this.margin;
            var y = this.cameraOffset.y + this.margin;
            var startingX = x;
            var startingY = y;
            this.buttons.forEach(function (button) {
                button.x = x;
                button.y = y;
                y += button.height + _this.spacing;
                return true;
            });
        };
        return ButtonGroup;
    })(Phaser.Group);
    KGAD.ButtonGroup = ButtonGroup;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var PurchaseMenu = (function (_super) {
        __extends(PurchaseMenu, _super);
        function PurchaseMenu() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(PurchaseMenu.prototype, "ready", {
            get: function () {
                return this._ready;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PurchaseMenu.prototype, "parchment", {
            get: function () {
                return this._parchment;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PurchaseMenu.prototype, "parchmentPosition", {
            get: function () {
                return this.parchment.cameraOffset;
            },
            enumerable: true,
            configurable: true
        });
        PurchaseMenu.prototype.init = function (context) {
            _super.prototype.init.call(this, context);
            this._ready = false;
        };
        PurchaseMenu.prototype.create = function () {
            var _this = this;
            this._parchment = this.game.add.sprite(this.camera.view.width, 0, 'parchment');
            this.parchment.cameraOffset.x = this.camera.view.width - 1;
            this.parchment.renderPriority = 3;
            var tween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width - this.parchment.width }, 250, Phaser.Easing.Exponential.In, true, 500);
            this.parchment.fixedToCamera = true;
            this.parchment.x = 0;
            var headerText = KGAD.Text.createText("Mercenaries", {
                style: {
                    fill: "#000000",
                    font: "28px MedievalSharpBook"
                }
            });
            this._headerText = this.game.make.sprite(this.parchmentPosition.x + 20, this.parchmentPosition.y + 10);
            this._headerText.addChild(headerText);
            this._headerText.fixedToCamera = true;
            this._headerText.renderPriority = 4;
            this.world.add(this._headerText);
            this._readyButton = new KGAD.Button('ready_button', this.camera.view.width, this.camera.view.height - 52, 96, 48);
            this._readyButton.create();
            this._readyButton.clicked.add(this.onReadyClicked, this);
            this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width - this._readyButton.width - 4 }, 250, Phaser.Easing.Exponential.In, true, 500);
            this._clicked = false;
            // TODO:
            this._mercenariesForHire = [
                this.game.cache.getJSON('mercenary_longbowman')
            ];
            this._mercenaryButtons = [
                new KGAD.Button('merc_frame', this.camera.view.width, 0, 36, 36)
            ];
            var parchment = this._parchment;
            for (var i = 0, l = this._mercenaryButtons.length; i < l; ++i) {
                var mercType = this._mercenariesForHire[i];
                var button = this._mercenaryButtons[i];
                button.create();
                var sprite = this.game.add.sprite(this.camera.view.width, 0, mercType.key);
                KGAD.AnimationLoader.addAnimationToSprite(sprite, mercType.key);
                sprite.animations.play('face_down', 0, false);
                sprite.fixedToCamera = true;
                sprite.anchor.set(0.5, 0.5);
                sprite.renderPriority = 999;
                var phaserButton = button.button;
                phaserButton.fixedToCamera = true;
                phaserButton.renderPriority = 4;
                phaserButton['update'] = function () {
                    phaserButton.cameraOffset.x = parchment.cameraOffset.x + 16;
                    phaserButton.cameraOffset.y = parchment.cameraOffset.y + 48;
                    sprite.cameraOffset.x = phaserButton.cameraOffset.x + phaserButton.width / 2;
                    sprite.cameraOffset.y = phaserButton.cameraOffset.y + phaserButton.height / 2;
                };
                button['previewSprite'] = sprite;
                button.clicked.add(function (btn) {
                    _this.hideParchment();
                    _this.startPreviewingMercenaryPlacement(btn);
                }, this);
            }
            this._parchmentHidden = false;
            this.updateButtonStatus();
        };
        PurchaseMenu.prototype.update = function () {
            var _this = this;
            _super.prototype.update.call(this);
            this._headerText.cameraOffset.x = this.parchmentPosition.x + 20;
            this._headerText.cameraOffset.y = this.parchmentPosition.y + 10;
            if (!this._clicked && (this.game.input.gamepad.isDown(Phaser.Gamepad.XBOX360_START) || this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER))) {
                this._clicked = true;
                this._readyButton.button.frame = 1;
                this.game.time.events.add(50, function () {
                    _this._readyButton.button.frame = 2;
                    _this.onReadyClicked();
                    _this.game.time.events.add(50, function () {
                        _this._readyButton.button.frame = 1;
                    }, _this);
                }, this);
            }
            if (this._parchmentHidden) {
                if (this._parchment.input.checkPointerOver(this.game.input.activePointer)) {
                    this.showParchment();
                }
                else if (this.game.input.activePointer.isDown) {
                    this.handleMouseClicked(this.game.input.activePointer.x, this.game.input.activePointer.y);
                }
            }
        };
        PurchaseMenu.prototype.destroy = function () {
            var _this = this;
            _super.prototype.destroy.call(this);
            var parchmentTween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width + 1 }, 250, Phaser.Easing.Exponential.Out, true, 0);
            var readyButtonTween = this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width + 1 }, 250, Phaser.Easing.Exponential.Out, true, 0);
            parchmentTween.onComplete.addOnce(function () {
                _this._parchment.kill();
            }, this);
            readyButtonTween.onComplete.addOnce(function () {
                _this._readyButton.button.kill();
            });
            this._headerText.destroy(true);
            this.stopPreviewingMercenaryPlacement();
            for (var i = 0, l = this._mercenaryButtons.length; i < l; ++i) {
                var button = this._mercenaryButtons[i];
                button.button.kill();
            }
        };
        PurchaseMenu.prototype.startPreviewingMercenaryPlacement = function (button) {
            var _this = this;
            var sprite = button['previewSprite'];
            if (sprite) {
                this._previewButton = button;
                this._previewSprite = this.game.add.sprite(0, 0, sprite.key);
                this._previewKey = 'mercenary_' + sprite.key;
                var mercType = this.game.cache.getJSON(this._previewKey);
                KGAD.AnimationLoader.addAnimationToSprite(this._previewSprite, this._previewKey);
                this._previewSprite.key = null;
                this._previewSprite.animations.play('face_down', 1, false);
                this._previewSprite.alpha = 0.5;
                this._previewSprite.anchor.setTo(0.5);
                this._previewSprite.tint = 0xFF7777;
                this._previewSprite.renderPriority = 9;
                this._previewSprite['update'] = function () {
                    if (!_this._parchmentHidden) {
                        return;
                    }
                    var pos = _this.map.fromPixels(_this.game.input.activePointer.worldX, _this.game.input.activePointer.worldY);
                    pos = _this.map.toPixels(pos).add(16, 16);
                    _this._previewSprite.x = pos.x;
                    _this._previewSprite.y = pos.y;
                    //this.game.debug.rectangle(new Phaser.Rectangle(pos.x - 16, pos.y - 16, 32, 32), '#FFFFFF', false);
                    if ((mercType.canPerch && KGAD.OccupiedGrid.canOccupyInPixels(null, _this._previewSprite.position)) || _this.map.canPerchInPixels(_this._previewSprite.x, _this._previewSprite.y)) {
                        _this._previewSprite.tint = 0x77FF77;
                    }
                    else {
                        _this._previewSprite.tint = 0xFF7777;
                    }
                };
            }
        };
        PurchaseMenu.prototype.stopPreviewingMercenaryPlacement = function () {
            if (this._previewSprite) {
                this._previewSprite['update'] = function () {
                };
                this._previewSprite.kill();
                this._previewSprite = null;
            }
        };
        PurchaseMenu.prototype.hideParchment = function () {
            var _this = this;
            var tween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width - 16 }, 250, Phaser.Easing.Exponential.Out, false, 0);
            tween.onComplete.addOnce(function () {
                _this._parchmentHidden = true;
                _this._parchment.inputEnabled = true;
            });
            tween.start();
            this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width }, 250, Phaser.Easing.Exponential.Out, true, 0);
        };
        PurchaseMenu.prototype.showParchment = function () {
            var tween = this.game.add.tween(this.parchment.cameraOffset).to({ x: this.camera.view.width - this.parchment.width }, 250, Phaser.Easing.Exponential.Out, false, 0);
            tween.start();
            this.game.add.tween(this._readyButton.button.cameraOffset).to({ x: this.camera.view.width - this._readyButton.width - 4 }, 250, Phaser.Easing.Exponential.Out, true);
            this.stopPreviewingMercenaryPlacement();
            this._parchmentHidden = false;
            this._parchment.inputEnabled = false;
            this._previewButton.button.bringToTop();
            var preview = this._previewButton['previewSprite'];
            preview.bringToTop();
        };
        /**
         *  Determine what to do when the user clicks.
         */
        PurchaseMenu.prototype.handleMouseClicked = function (x, y) {
            if (!this._previewSprite) {
                return;
            }
            var tile = this.map.fromPixels(new Phaser.Point(this._previewSprite.x, this._previewSprite.y));
            var position = this.map.toPixels(tile).add(KGAD.GameMap.TILE_WIDTH / 2, KGAD.GameMap.TILE_HEIGHT / 2);
            var mercType = this.game.cache.getJSON(this._previewKey);
            var canOccupy = KGAD.OccupiedGrid.canOccupyInPixels(null, position.x, position.y);
            var canPerch = mercType.canPerch && this.map.canPerchInPixels(position.x, position.y);
            var isPerched = canPerch && !canOccupy;
            if ((mercType.canPerch && this.map.canPerchInPixels(position.x, position.y)) || canOccupy) {
                var merc = this.actors.createMercenary(position.x, position.y, mercType);
                merc.isPerched = isPerched;
                this.hero.gold -= mercType.cost;
                this.updateButtonStatus();
                this.showParchment();
            }
        };
        PurchaseMenu.prototype.updateButtonStatus = function () {
            for (var i = 0, l = this._mercenaryButtons.length; i < l; ++i) {
                var button = this._mercenaryButtons[i];
                var mercType = this._mercenariesForHire[i];
                button.disabled = this.hero.gold < mercType.cost;
                var sprite = button['previewSprite'];
                if (button.disabled) {
                    sprite.tint = 0x777777;
                }
                else {
                    sprite.tint = 0xFFFFFF;
                }
            }
        };
        PurchaseMenu.prototype.onReadyClicked = function () {
            this._ready = true;
        };
        return PurchaseMenu;
    })(KGAD.GameController);
    KGAD.PurchaseMenu = PurchaseMenu;
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
    var MoveTween = (function () {
        function MoveTween(game, sprite) {
            this.game = game;
            this.sprite = sprite;
            this.currentDestination = null;
            this.map = KGAD.Game.CurrentMap;
            this.blockedTime = 0;
            this.isComplete = true;
            this.tweening = false;
            this.blocked = new Phaser.Signal();
            this.completed = new Phaser.Signal();
        }
        Object.defineProperty(MoveTween.prototype, "isRunning", {
            /**
             *  Gets whether or not the movement is running.
             */
            get: function () {
                return !this.isComplete;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *  Stop the movement tween.
         */
        MoveTween.prototype.stop = function (complete) {
            if (complete === void 0) { complete = true; }
            this.currentDestination = null;
            this.timeToMove = 0;
            this.blockedTime = 0;
            this.isComplete = true;
            if (complete) {
                this.completed.dispatch();
            }
        };
        /**
         *  Move to the given (x, y) coordinate (in pixels).
         */
        MoveTween.prototype.moveTo = function (x, y) {
            var dest;
            if (typeof x === 'number') {
                dest = new Phaser.Point(x, y);
            }
            else {
                dest = x.clone();
            }
            this.currentDestination = dest;
            this.generateData();
            return true;
        };
        /**
         *  Updates the internal tween.
         */
        MoveTween.prototype.update = function () {
            this.step();
        };
        /**
         *  Generates the data required to step.
         */
        MoveTween.prototype.generateData = function () {
            this.angle = this.game.physics.arcade.angleBetween(this.sprite.position, this.currentDestination);
            this.direction = KGAD.MovementHelper.getDirectionFromAngle(this.angle);
            this.distance = Phaser.Point.distance(this.sprite.position, this.currentDestination);
            this.timeToMove = (this.distance / this.sprite.movementSpeed) * 1000.0;
            this.isComplete = this.timeToMove === 0;
        };
        /**
         *  Move towards the goal.
         */
        MoveTween.prototype.step = function () {
            var _this = this;
            if (this.currentDestination == null || this.isComplete || this.tweening) {
                return;
            }
            var dt = this.game.time.physicsElapsedMS;
            this.timeToMove -= dt;
            var completeMovement = false;
            if (this.timeToMove <= 0) {
                completeMovement = true;
            }
            var xMovement = Math.cos(this.angle);
            var yMovement = Math.sin(this.angle);
            var oldX = this.sprite.x;
            var oldY = this.sprite.y;
            var x, y;
            if (completeMovement) {
                x = this.currentDestination.x;
                y = this.currentDestination.y;
            }
            else {
                x = oldX + xMovement * this.game.time.physicsElapsed * this.sprite.movementSpeed;
                y = oldY + yMovement * this.game.time.physicsElapsed * this.sprite.movementSpeed;
            }
            var occupants = [];
            this.sprite.position.set(x, y);
            if (!KGAD.OccupiedGrid.add(this.sprite, occupants)) {
                this.sprite.position.set(oldX, oldY);
                completeMovement = false;
                this.timeToMove += dt;
                this.handleBlocked(occupants);
            }
            if (completeMovement) {
                if (Math.abs(oldX - x) > 1 || Math.abs(oldY - y) > 1) {
                    this.sprite.position.set(oldX, oldY);
                    KGAD.OccupiedGrid.add(this.sprite);
                    if (this.centering) {
                        var distance = Phaser.Point.distance(this.sprite.position, this.currentDestination);
                        var speed = (this.distance / (this.sprite.movementSpeed * 4)) * 1000.0;
                        var tween = this.game.add.tween(this.sprite).to({ x: this.currentDestination.x, y: this.currentDestination.y }, this.sprite.movementSpeed * 2, Phaser.Easing.Linear.None, false);
                        this.tweening = true;
                        tween.onComplete.addOnce(function () {
                            _this.tweening = false;
                            KGAD.OccupiedGrid.add(_this.sprite);
                            _this.onMovementCompleted();
                        });
                        tween.start();
                    }
                    else {
                        this.centerOnTile();
                    }
                }
                else {
                    this.onMovementCompleted();
                }
            }
        };
        /**
         *  Move to the center of a tile.
         */
        MoveTween.prototype.centerOnTile = function () {
            this.generateData();
            this.centering = true;
            console.log('centering... distance=' + this.distance + ', time=' + this.timeToMove);
        };
        /**
         *  Called internally.
         */
        MoveTween.prototype.onMovementCompleted = function () {
            this.isComplete = true;
            this.centering = false;
            this.currentDestination = null;
            this.completed.dispatch();
        };
        /**
         *  Figure out what to do when we're blocked from moving to the next tile.
         */
        MoveTween.prototype.handleBlocked = function (byWho) {
            if (this.blockedTime === 0) {
                this.blockedTime = this.game.time.now;
            }
            else {
                var beingBlockedByEnemy = false;
                for (var i = 0, l = byWho.length; i < l; ++i) {
                    if (byWho[i].alliance !== this.sprite.alliance) {
                        beingBlockedByEnemy = true;
                        break;
                    }
                }
                if (beingBlockedByEnemy || this.game.time.now - this.blockedTime >= MoveTween.BLOCKED_THRESHOLD) {
                    console.log(this.sprite.key + ' is blocked by ' + (byWho[0] || { key: 'a wall' }).key + ', stopping tween');
                    this.stop(false);
                    this.blocked.dispatch(byWho);
                }
            }
        };
        MoveTween.BLOCKED_THRESHOLD = 250;
        return MoveTween;
    })();
    KGAD.MoveTween = MoveTween;
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
/// <reference path="AnimatedSprite.ts" />
var KGAD;
(function (KGAD) {
    var HealthBar = (function () {
        function HealthBar(game, parent) {
            this.game = game;
            this.parent = parent;
            this.position = new Phaser.Point();
        }
        Object.defineProperty(HealthBar.prototype, "maxHealth", {
            get: function () {
                return this._maxHealth;
            },
            set: function (_maxHealth) {
                this._maxHealth = _maxHealth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HealthBar.prototype, "visible", {
            get: function () {
                return this.healthBarFrame.visible;
            },
            set: function (_visible) {
                this._visible = _visible;
                this.healthBarFrame.visible = _visible;
                this._healthBar.visible = _visible;
            },
            enumerable: true,
            configurable: true
        });
        HealthBar.prototype.init = function (maxHealth) {
            this.healthBarFrame = this.game.make.sprite(0, 0, 'healthbar_frame');
            this._healthBar = this.game.make.sprite(0, 0, 'healthbar');
            this.healthBarFrame.visible = false;
            this._healthBar.visible = false;
            this.healthBarFrame.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            this._healthBar.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            this.healthBarFrame.renderPriority = 2;
            this._healthBar.renderPriority = 1;
            this.game.world.add(this.healthBarFrame);
            this.game.world.add(this._healthBar);
            this.visible = false;
            this.fullWidth = this._healthBar.width;
            this.maxHealth = maxHealth || 1;
            this.updateHealthBarValue();
            this.updatePosition();
        };
        HealthBar.prototype.update = function () {
            if (this._visible) {
                this.updatePosition();
                this.updateHealthBarValue();
            }
        };
        HealthBar.prototype.destroy = function () {
            this.visible = false;
            this.healthBarFrame.destroy();
            this._healthBar.destroy();
        };
        HealthBar.prototype.updatePosition = function () {
            var parent = this.parent;
            var x = parent.position.x - (32 * parent.anchor.x);
            var y = parent.position.y - (32 * parent.anchor.y) - this.healthBarFrame.height - 5;
            this.position.set(x, y);
            this.healthBarFrame.position.set(x, y);
            this._healthBar.position.set(x, y);
            //this._healthBar.bringToTop();
            //this.healthBarFrame.bringToTop();
        };
        HealthBar.prototype.updateHealthBarValue = function () {
            var parent = this.parent;
            var health = parent.health;
            if (health > this.maxHealth) {
                this.maxHealth = health;
            }
            var percent = Phaser.Math.clamp(health / this.maxHealth, 0, 1);
            this._healthBar.visible = health > 0 && parent.exists && parent.alive && percent < 1;
            this.healthBarFrame.visible = health > 0 && parent.exists && parent.alive && percent < 1;
            if (health > 0) {
                this._healthBar.width = this.fullWidth - Math.ceil(this.fullWidth * (1 - percent));
                if (percent > 0.5) {
                    this._healthBar.tint = 0x00FF00;
                }
                else if (percent > 0.2 && percent <= 0.5) {
                    this._healthBar.tint = 0xFFFF00;
                }
                else if (percent <= 0.2) {
                    this._healthBar.tint = 0xFF0000;
                }
            }
        };
        return HealthBar;
    })();
    KGAD.HealthBar = HealthBar;
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
        CollisionHelper.raycastFirstTile = function (line, stepRate, pixelPoint) {
            if (stepRate === void 0) { stepRate = 4; }
            var undef;
            var map = KGAD.Game.CurrentMap, hit = null, coords;
            coords = line.coordinatesOnLine(stepRate, undef);
            for (var k = 0, n = coords.length; k < n; ++k) {
                var coord = coords[k];
                var tileCoord = map.fromPixels(coord[0], coord[1]);
                if (map.isWall(tileCoord.x, tileCoord.y)) {
                    hit = new Phaser.Rectangle(tileCoord.x * KGAD.GameMap.TILE_WIDTH, tileCoord.y * KGAD.GameMap.TILE_HEIGHT, KGAD.GameMap.TILE_WIDTH, KGAD.GameMap.TILE_HEIGHT);
                    if (pixelPoint) {
                        pixelPoint.x = coord[0];
                        pixelPoint.y = coord[1];
                    }
                    break;
                }
            }
            return hit;
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
    var DemoState = (function (_super) {
        __extends(DemoState, _super);
        function DemoState() {
            _super.call(this);
            this.addCallbacks = true;
        }
        DemoState.prototype.create = function () {
            var _this = this;
            this.camera.bounds.x = 0;
            this.camera.bounds.y = 0;
            var delay = 0;
            var createTween = function (text) {
                text.alpha = 0;
                var tween = _this.game.add.tween(text).to({ alpha: 1 }, 50, Phaser.Easing.Cubic.InOut, true, delay, 3);
                delay += 500;
                _this.game.world.add(text);
                return tween;
            };
            var header = KGAD.Text.createText("Thanks for playing!", {
                centeredX: true,
                y: 24,
                style: {
                    align: "center",
                    fill: "#77FF77",
                    font: "36px MedievalSharpBook"
                }
            });
            var subHeader = KGAD.Text.createText("Features planned:", {
                centeredX: true,
                y: header.y + header.height + 2,
                style: {
                    align: "center",
                    fill: "#FFFFFF",
                    font: "26px MedievalSharpBook"
                }
            });
            var featuresStyle = {
                font: "22px MedievalSharpBook",
                align: "left",
                fill: "#FFFFFF"
            };
            var features = KGAD.Text.createLines([
                "- Full campaign mode",
                "- More mercenaries for hire",
                "- Build traps",
                "- Re-work graphics",
                "- Music and sound",
                "- Stat upgrades",
                "- Player abilities",
                "- More skill challenges",
                "- Buy new skins and weapons with microtransactions",
                "- (I'm joking)",
                "- (Probably)",
                "- King will react to being attacked",
            ], { x: 75, y: subHeader.y + subHeader.height + 5, style: featuresStyle }, 1);
            var lastItem = features[features.length - 1];
            var anyKeyText = "Press any key to continue.";
            if (this.game.input.gamepad.padsConnected > 0) {
                anyKeyText = "Press any button to continue.";
            }
            var measurements = KGAD.Text.measureText(anyKeyText, 20);
            var pressAnyKey = KGAD.Text.createText(anyKeyText, {
                centerX: true,
                x: this.stage.width / 2 - measurements.width / 2,
                y: this.stage.height - subHeader.height - 5,
                style: {
                    align: "center",
                    fill: "#FFFFFF",
                    font: "20px MedievalSharpBook"
                }
            });
            createTween(header);
            createTween(subHeader);
            for (var i = 0, l = features.length; i < l; ++i) {
                createTween(features[i]);
            }
            createTween(pressAnyKey);
            this.timeToWait = delay;
            this.setUpInput = false;
        };
        DemoState.prototype.update = function () {
            if (this.timeToWait > 0) {
                this.timeToWait -= this.time.physicsElapsedMS;
                if (this.timeToWait < 0) {
                    this.timeToWait = 0;
                }
            }
            if (this.timeToWait === 0 && !this.setUpInput) {
                this.addAnyKeyHandler();
                this.setUpInput = true;
            }
            if (this.timeToWait === 0) {
                if (this.input.activePointer.isDown) {
                    this.switchStates();
                }
            }
        };
        DemoState.prototype.switchStates = function () {
            if (this.game.state.current === KGAD.States.Demo) {
                KGAD.States.Instance.switchTo(KGAD.States.Boot, true, false);
            }
        };
        DemoState.prototype.addAnyKeyHandler = function () {
            var _this = this;
            if (this.addCallbacks) {
                this.addCallbacks = false;
            }
            else {
                return;
            }
            this.game.input.keyboard.addCallbacks(this, null, this.switchStates);
            this.game.input.gamepad.addCallbacks(this, {
                onUp: function () {
                    _this.switchStates();
                }
            });
        };
        return DemoState;
    })(Phaser.State);
    KGAD.DemoState = DemoState;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var GameContext = (function () {
        function GameContext(props) {
            $.extend(this, props);
        }
        return GameContext;
    })();
    KGAD.GameContext = GameContext;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var InfoState = (function (_super) {
        __extends(InfoState, _super);
        function InfoState() {
            _super.call(this);
            this.addCallbacks = true;
        }
        InfoState.prototype.init = function (args) {
            this.map = args[0];
            this.script = args[1];
        };
        InfoState.prototype.create = function () {
            var _this = this;
            this.camera.bounds.x = 0;
            this.camera.bounds.y = 0;
            var delay = 0;
            var createTween = function (text) {
                text.alpha = 0;
                var tween = _this.game.add.tween(text).to({ alpha: 1 }, 50, Phaser.Easing.Cubic.InOut, true, delay, 3);
                delay += 500;
                _this.game.world.add(text);
                return tween;
            };
            var header = KGAD.Text.createText("How to Play", {
                centeredX: true,
                y: 24,
                style: {
                    align: "center",
                    fill: "#FFFF77",
                    font: "36px MedievalSharpBook"
                }
            });
            var featuresStyle = {
                font: "22px MedievalSharpBook",
                align: "left",
                fill: "#FFFFFF"
            };
            var features = KGAD.Text.createLines([
                "Use arrow keys, WASD, or XBox 360 DPAD to move",
                "Z, Y, Spacebar, or the XBox 360 'A' button to shoot",
                "Hold the 'shoot' button to charge your weapon.",
                "",
                "Tip: You can place archers on castle walls."
            ], { x: 50, y: 125, style: featuresStyle }, 1);
            var lastItem = features[features.length - 1];
            var anyKeyText = "Press any key to continue.";
            if (this.game.input.gamepad.padsConnected > 0) {
                anyKeyText = "Press any button to continue.";
            }
            var measurements = KGAD.Text.measureText(anyKeyText, 20);
            var pressAnyKey = KGAD.Text.createText(anyKeyText, {
                centerX: true,
                x: this.stage.width / 2 - measurements.width / 2,
                y: this.stage.height - measurements.height - 5,
                style: {
                    align: "center",
                    fill: "#FFFFFF",
                    font: "20px MedievalSharpBook"
                }
            });
            createTween(header);
            for (var i = 0, l = features.length; i < l; ++i) {
                createTween(features[i]);
            }
            createTween(pressAnyKey);
            this.timeToWait = delay;
            this.setUpInput = false;
        };
        InfoState.prototype.update = function () {
            if (this.timeToWait > 0) {
                this.timeToWait -= this.time.physicsElapsedMS;
                if (this.timeToWait < 0) {
                    this.timeToWait = 0;
                }
            }
            if (this.timeToWait === 0 && !this.setUpInput) {
                this.addAnyKeyHandler();
                this.setUpInput = true;
            }
            if (this.timeToWait === 0) {
                if (this.input.activePointer.isDown) {
                    this.switchStates();
                }
            }
        };
        InfoState.prototype.switchStates = function () {
            if (this.game.state.current === KGAD.States.Info) {
                KGAD.States.Instance.switchTo(KGAD.States.GameSimulation, true, false, this.map, this.script);
            }
        };
        InfoState.prototype.addAnyKeyHandler = function () {
            var _this = this;
            if (this.addCallbacks) {
                this.addCallbacks = false;
            }
            else {
                return;
            }
            this.game.input.keyboard.addCallbacks(this, null, this.switchStates);
            this.game.input.gamepad.addCallbacks(this, {
                onUp: function () {
                    _this.switchStates();
                }
            });
        };
        return InfoState;
    })(Phaser.State);
    KGAD.InfoState = InfoState;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var SkillChallengeIntroState = (function (_super) {
        __extends(SkillChallengeIntroState, _super);
        function SkillChallengeIntroState() {
            _super.apply(this, arguments);
        }
        SkillChallengeIntroState.prototype.init = function (args) {
            this.map = args[0];
            this.script = args[1];
            this.ready = false;
            this.centerX = this.centerX || KGAD.Game.Width / 2;
            this.centerY = this.centerY || KGAD.Game.Height / 2;
        };
        SkillChallengeIntroState.prototype.preload = function () {
            this.game.input.gamepad.start();
        };
        SkillChallengeIntroState.prototype.create = function () {
            var _this = this;
            var headerText = this.game.add.text(0, 0, 'SKILL CHALLENGE', {
                font: '36px MedievalSharpBook',
                fill: '#FFFFFF',
                align: 'center'
            });
            headerText.position.set(this.centerX - (headerText.width / 2), 50);
            headerText.fixedToCamera = true;
            var childStyle = {
                font: '20px MedievalSharpBook',
                fill: '#FFFFFF',
                align: 'left'
            };
            var initialHeight = 125;
            var firstRow = this.game.add.text(25, initialHeight, '- Protect the king.', childStyle);
            var yIncrement = firstRow.height + 5;
            this.game.add.text(25, initialHeight + (yIncrement * 1), "- Don't die.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 2), "- Enemies can't die.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 3), "- Enemies will try to kill the king.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 4), "- Attack enemies to make them focus on you.", childStyle);
            this.game.add.text(25, initialHeight + (yIncrement * 5), "- Kite enemies around, but don't get trapped.", childStyle);
            var minutes = this.game.add.text(this.centerX, initialHeight + (yIncrement * 7), "You have 3 minutes.", childStyle);
            minutes.x = this.centerX - (minutes.width / 2);
            var beginKeyText = "Press any key to begin.";
            var beginButtonText = "Press any button to begin.";
            var gamepadEnabled = this.game.input.gamepad.padsConnected > 0;
            var gamepadText = null;
            if (gamepadEnabled) {
                gamepadText = this.game.add.text(this.centerX, initialHeight + (yIncrement * 10), "(Gamepad is enabled!)", {
                    font: '18px MedievalSharpBook',
                    fill: '#99FF99',
                    align: 'center'
                });
                gamepadText.x = this.centerX - (gamepadText.width / 2);
            }
            else {
                gamepadText = this.game.add.text(this.centerX, initialHeight + (yIncrement * 10), "(Press any button on the gamepad to use it.)", {
                    font: '18px MedievalSharpBook',
                    fill: '#CCCCCC',
                    align: 'center'
                });
                gamepadText.x = this.centerX - (gamepadText.width / 2);
            }
            var beginTextObj = this.game.add.text(this.centerX, initialHeight + (yIncrement * 9), gamepadEnabled ? beginButtonText : beginKeyText, childStyle);
            beginTextObj.x = this.centerX - (beginTextObj.width / 2);
            this.game.input.keyboard.addCallbacks(this, null, function () {
                _this.ready = true;
            });
            this.game.input.gamepad.addCallbacks(this, {
                onConnect: function () {
                    if (gamepadText) {
                        gamepadText.destroy();
                    }
                    gamepadEnabled = true;
                    gamepadText = _this.game.add.text(_this.centerX, initialHeight + (yIncrement * 10), "(Gamepad is enabled!)", {
                        font: '18px MedievalSharpBook',
                        fill: '#99FF99',
                        align: 'center'
                    });
                    gamepadText.x = _this.centerX - (gamepadText.width / 2);
                    beginTextObj.text = beginButtonText;
                },
                onDisconnect: function () {
                    if (_this.game.input.gamepad.padsConnected < 1) {
                        gamepadEnabled = false;
                        if (gamepadText) {
                            gamepadText.visible = false;
                            gamepadText.destroy();
                            beginTextObj.text = beginKeyText;
                        }
                    }
                },
                onUp: function () {
                    _this.ready = true;
                }
            });
        };
        SkillChallengeIntroState.prototype.update = function () {
            if (this.game.input.activePointer.isDown) {
                this.ready = true;
            }
            if (this.ready) {
                var states = KGAD.States.Instance;
                states.switchTo(KGAD.States.GameSimulation, true, false, this.map, this.script, true);
            }
        };
        return SkillChallengeIntroState;
    })(Phaser.State);
    KGAD.SkillChallengeIntroState = SkillChallengeIntroState;
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
        GameMap.prototype.toPixels = function (x, y) {
            if (typeof x === 'number') {
                return new Phaser.Point(x * GameMap.TILE_WIDTH, y * GameMap.TILE_HEIGHT);
            }
            else {
                return Phaser.Point.multiply(x, new Phaser.Point(GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT));
            }
        };
        /**
         *  Converts a number or point to tile coordinates.
         */
        GameMap.prototype.fromPixels = function (x, y) {
            if (typeof x === 'number') {
                return new Phaser.Point(Math.floor(x / GameMap.TILE_WIDTH), Math.floor(y / GameMap.TILE_HEIGHT));
            }
            else {
                return new Phaser.Point(Math.floor(x.x / GameMap.TILE_WIDTH), Math.floor(x.y / GameMap.TILE_HEIGHT));
            }
        };
        /**
         *  Finds the shortest path from the given point to the given point (in tiles).
         */
        GameMap.prototype.findPath = function (from, to, fullSearch, customNodes) {
            if (fullSearch === void 0) { fullSearch = false; }
            if (customNodes === void 0) { customNodes = []; }
            if (from.x < 0 || from.x >= this.width || from.y < 0 || from.y >= this.height) {
                throw new RangeError("Pathfinding: 'from' coordinate is out of range: (" + from.x + ", " + from.y + ") width=" + this.width + ", height=" + this.height);
            }
            if (to.x < 0 || to.x >= this.width || to.y < 0 || to.y >= this.height) {
                throw new RangeError("Pathfinding: 'to' coordinate is out of range: (" + to.x + ", " + to.y + ")");
            }
            return this.pathfinder.findPath(from, to, fullSearch, customNodes);
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
         *  Check if you can perch at the given tile.
         */
        GameMap.prototype.canPerchInPixels = function (x, y) {
            var result = false;
            var collidingTiles = this.perchLayer.getTiles(x, y, GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT, false, false);
            if (collidingTiles == null || collidingTiles.length === 0) {
                result = false;
            }
            else {
                for (var i = 0, l = collidingTiles.length; i < l; ++i) {
                    var tile = collidingTiles[i];
                    if (this.checkProperty(tile.properties, 'perch')) {
                        result = true;
                        break;
                    }
                }
            }
            return result;
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
                var isPerchLayer = false;
                var isVisible = true;
                if (layerData.properties.hasOwnProperty("collision_layer")) {
                    isCollisionLayer = true;
                    isVisible = false;
                }
                else if (layerData.properties.hasOwnProperty("perch_layer")) {
                    isPerchLayer = true;
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
                        var canPass = this.checkProperty(tile.properties, "can_pass", true);
                        if (!canPass) {
                            tile.canCollide = true;
                            if (indices.indexOf(tile.index) < 0) {
                                this.tilemap.setCollisionByIndex(tile.index, true, layer.index, true);
                                indices.push(tile.index);
                            }
                        }
                        else {
                            var collides = [
                                this.checkProperty(tile.properties, "checkCollision.up"),
                                this.checkProperty(tile.properties, "checkCollision.down"),
                                this.checkProperty(tile.properties, "checkCollision.left"),
                                this.checkProperty(tile.properties, "checkCollision.right")
                            ];
                            if (collides[0])
                                tile.collideUp = true;
                            if (collides[1])
                                tile.collideDown = true;
                            if (collides[2])
                                tile.collideLeft = true;
                            if (collides[3])
                                tile.collideRight = true;
                        }
                        if (this.checkProperty(tile, "spawn_point")) {
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
                else if (isPerchLayer) {
                    this.perchLayer = layer;
                }
                if (isVisible) {
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
            var pixelPos = null;
            var p = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
                pixelPos = new Phaser.Point(x, y);
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
                pixelPos = x;
            }
            return OccupiedGrid.canOccupy(sprite, p, null, collisions, pixelPos);
        };
        /**
         *  Checks if the given sprite can occupy the given (x, y) tile coordinate.
         */
        OccupiedGrid.canOccupy = function (sprite, x, y, collisions, pixelPos) {
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
                var pixelPos = pixelPos || new Phaser.Point(p.x * OccupiedGrid.NODE_SIZE, p.y * OccupiedGrid.NODE_SIZE);
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
        OccupiedGrid.add = function (sprite, occupants) {
            if (occupants === void 0) { occupants = []; }
            if (!sprite.alive || !sprite.exists || sprite.health <= 0) {
                OccupiedGrid.remove(sprite);
                return false;
            }
            var indices = OccupiedGrid.getIndicesOfSprite(sprite, true);
            if ($.inArray(-1, indices) >= 0) {
                return false;
            }
            var canOccupy = true;
            var idx;
            for (var j = 0, l = indices.length; j < l; ++j) {
                idx = indices[j];
                var occupant = OccupiedGrid._grid[idx];
                if (occupant && occupant !== sprite) {
                    canOccupy = false;
                    occupants.push(occupant);
                }
            }
            if (!canOccupy) {
                return false;
            }
            OccupiedGrid.remove(sprite);
            for (j = 0, l = indices.length; j < l; ++j) {
                idx = indices[j];
                OccupiedGrid._grid[idx] = sprite;
            }
            OccupiedGrid.updateIndices(sprite, indices);
            return true;
        };
        OccupiedGrid.updateIndices = function (sprite, indices) {
            sprite.gridIndices = indices;
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
        Pathfinding.prototype.findPath = function (from, to, fullSearch, customWeights) {
            if (fullSearch === void 0) { fullSearch = false; }
            if (customWeights === void 0) { customWeights = []; }
            this.createGrid();
            var start = this.graph.grid[from.x][from.y];
            var end = this.graph.grid[to.x][to.y];
            if (!fullSearch) {
                var miniGrid = this.createMiniGrid(from, to, customWeights);
                var path = astar.search(miniGrid, start, end);
            }
            if (fullSearch || path.length === 0) {
                path = astar.search(this.graph, start, end);
            }
            if (path.length === 0) {
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
        Pathfinding.prototype.createMiniGrid = function (from, to, custom) {
            if (custom === void 0) { custom = []; }
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
            for (var i = 0, l = custom.length; i < l; ++i) {
                var node = custom[i];
                if (node && node.x >= 0 && node.y >= 0 && node.x < width && node.y < height) {
                    grid[node.x][node.y] = node.weight;
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
        /**
         *  Fill an array with the given value.
         */
        Arrays.fill = function (arr, length, value) {
            for (var i = 0; i < length; ++i) {
                arr[i] = value;
            }
            return arr;
        };
        return Arrays;
    })();
    KGAD.Arrays = Arrays;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    /**
     *  Static helper utilities for input.
     */
    var Input = (function () {
        function Input() {
        }
        /**
         *  Disables player input on the given Hero object.
         */
        Input.disablePlayerInput = function (hero) {
            var doNothing = function () {
            };
            hero['moving'] = false;
            hero['disableInput'] = true;
            hero.action = KGAD.Actions.Standing;
            hero.weapon.cancelCharging();
            hero.updateAnimation();
            return hero;
        };
        /**
         *  Enables player input on the given Hero object.
         */
        Input.enablePlayerInput = function (hero) {
            hero['disableInput'] = false;
            return hero;
        };
        return Input;
    })();
    KGAD.Input = Input;
})(KGAD || (KGAD = {}));
// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    /**
     *  Contains a set of static utility functions for text manipulation.
     */
    var Text = (function () {
        function Text() {
        }
        /**
         *  Creates a text object.
         */
        Text.createText = function (text, opts) {
            opts = opts || {};
            var x = opts.x || 0;
            var y = opts.y || 0;
            var styles = $.extend({}, Text.defaultStyle, opts.style);
            var game = KGAD.Game.Instance;
            var width = KGAD.Game.Width;
            var height = KGAD.Game.Height;
            var textObject = game.make.text(x, y, text, styles);
            if (!!opts.centered) {
                textObject.x = (width / 2) - (textObject.width / 2);
                textObject.y = (height / 2) - (textObject.height / 2);
            }
            else {
                if (!!opts.centeredX) {
                    textObject.x = (width / 2) - (textObject.width / 2);
                }
                if (!!opts.centeredY) {
                    textObject.y = (height / 2) - (textObject.height / 2);
                }
            }
            textObject.fixedToCamera = !!opts.fixedToCamera;
            if (!!opts.addToWorld) {
                game.world.add(textObject);
            }
            return textObject;
        };
        /**
         *  Create multiple text lines.
         */
        Text.createLines = function (text, opts, spacing) {
            if (spacing === void 0) { spacing = 0; }
            opts = opts || {};
            var lines = [];
            var originalY = opts.y || 0;
            opts.y = originalY;
            for (var i = 0, l = text.length; i < l; ++i) {
                var textObject = Text.createText(text[i], opts);
                opts.y += textObject.height + spacing;
                lines.push(textObject);
            }
            opts.y = originalY;
            return lines;
        };
        /**
         *  Measures the width and height (in pixels) of the given text.
         */
        Text.measureText = function (text, fontSizePixels) {
            if (fontSizePixels === void 0) { fontSizePixels = 16; }
            var styles = $.extend({}, Text.defaultStyle, { font: (fontSizePixels | 0).toString() + "px MedievalSharpBook" });
            var game = KGAD.Game.Instance;
            var textObject = game.make.text(0, 0, text, styles);
            var measurements = {
                width: textObject.width,
                height: textObject.height
            };
            textObject.destroy();
            return measurements;
        };
        /**
         *  Gets or sets the default text style.
         */
        Text.defaultStyle = {
            fill: "#FFFFFF",
            font: "16px MedievalSharpBook",
            align: "left"
        };
        return Text;
    })();
    KGAD.Text = Text;
})(KGAD || (KGAD = {}));
//# sourceMappingURL=app.js.map