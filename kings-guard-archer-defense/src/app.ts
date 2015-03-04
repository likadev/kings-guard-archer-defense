// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../definitions/phaser.d.ts" />
/// <reference path="states/States.ts" />

module KGAD {
    export class Game extends Phaser.Game {
        private static instance: Game = null;
        private static currentMap: GameMap = null;
        private static actors: Actors = null;
        private static simulation: GameSimulationState = null;
        private static _onBlur: Phaser.Signal;
        private static _onFocus: Phaser.Signal;

        /**
         *  Gets the current game instance.
         */
        public static get Instance(): Game {
            return Game.instance;
        }

        /**
         *  Gets the current map.
         */
        public static get CurrentMap(): GameMap {
            return Game.currentMap;
        }

        /**
         *  Sets the current map.
         */
        public static set CurrentMap(map: GameMap) {
            this.currentMap = map;
        }

        /**
         *  Gets the current game simulation state.
         */
        public static get Simulation() {
            return this.simulation;
        }

        /**
         *  Sets the current game simulation state.
         */
        public static set Simulation(simulation: GameSimulationState) {
            this.simulation = simulation;
        }

        /**
         *  Gets the width of the container area.
         */
        public static get Width(): number {
            return $('#container').innerWidth();
        }

        /**
         *  Gets the height of the container area.
         */
        public static get Height(): number {
            return $('#container').innerHeight();
        }

        /**
         *  Gets the actors in the current game simulation.
         */
        public static get Actors(): Actors {
            return this.simulation == null ? null : this.simulation.actors;
        }

        /**
         *  Gets the player/hero unit.
         */
        public static get Hero(): Hero {
            return this.Actors == null ? null : this.Actors.hero;
        }

        /**
         *  Gets the king unit.
         */
        public static get King(): King {
            return this.Actors == null ? null : this.Actors.king;
        }

        /**
         *  Gets all active mercenaries in the current simulation.
         */
        public static get Mercenaries(): Mercenary[] {
            return this.Actors == null ? [] : this.Actors.mercenaries;
        }

        /**
         *  Gets all enemies in the current simulation.
         */
        public static get Enemies(): Enemy[] {
            return this.Actors == null ? [] : this.Actors.enemies;
        }

        /**
         *  Gets the current game context.
         */
        public static get Context(): GameContext {
            return this.Simulation == null ? null : this.Simulation.context;
        }

        /**
         *  Gets the projectile manager.
         */
        public static get Projectiles(): ProjectileManager {
            return this.Simulation == null ? null : this.Simulation.projectiles;
        }

        constructor(width: number, height: number, container: string) {
            if (Game.instance != null) {
                throw Error('Cannot create more than one \'Game\' instance!');
            }

            // please note, that IE11 now returns undefined again for window.chrome
            var isChromium = (<any>window).chrome,
                vendorName = window.navigator.vendor;
            var isChrome = (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.");
            var isFirefox: boolean = /firefox/.test(navigator.userAgent.toLowerCase());

            var renderer = isFirefox ? Phaser.CANVAS : Phaser.AUTO;
            super(width, height, renderer, container);

            Game.instance = this;

            if (!isChrome) {
                $('#messages').append(
                    $('<div>').html('For the best experience, please use <a href="https://www.google.com/chrome/browser/">Google Chrome</a>.')
                );
            }

            if (isFirefox && this.renderType === Phaser.CANVAS) {
                $('#messages').append(
                    $('<div>').html('The "damage flicker" on-hit effect is disabled in Firefox canvas rendering mode due to a crashing bug in Phaser/PIXI.')
                );
            }

            var states = new States();
            states.setUpStates();
            states.switchTo(States.Boot);
        }
    }
}

window.onload = () => {
    try {
        var game: KGAD.Game = null;

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
            // IE 9 and lower:
            else if ("onfocusin" in document)
                document.onfocusin = document.onfocusout = onchange;
            // All others:
            else
                window.onpageshow = window.onpagehide
                = window.onfocus = window.onblur = onchange;

            function onchange(evt) {
                var v = "visible", h = "hidden",
                    evtMap = {
                        focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
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