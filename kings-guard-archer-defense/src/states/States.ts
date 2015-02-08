// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../../definitions/phaser.d.ts" />
/// <reference path="BootState.ts" />
/// <reference path="MainMenuState.ts" />
/// <reference path="PreGameLoadingState.ts" />
/// <reference path="GameSimulationState.ts" />

module KGAD {
    export class States {
        private static instance: States = null;

        public static get Boot(): string { return 'Boot'; }

        public static get MainMenu(): string { return 'MainMenu'; }

        public static get PreGameLoading(): string { return 'PreGameLoading'; }

        public static get GameSimulation(): string { return 'GameSimulation'; }

        constructor() {
            States.instance = this;
        }

        public static get Instance(): States {
            return this.instance;
        }

        /**
         *  Initially sets up new states and adds them to Phaser.
         */
        public setUpStates(): void {
            var game: Game = Game.Instance;

            game.state.add(States.Boot, BootState, false);
            game.state.add(States.Boot, MainMenuState, false);
            game.state.add(States.PreGameLoading, PreGameLoadingState, false);
            game.state.add(States.GameSimulation, GameSimulationState, false);
        }

        /**
         * Switches to the given state.
         */
        public switchTo(key: string, clearWorld: boolean = false, clearCache: boolean = false, ...args: any[]): void {
            var game: Game = Game.Instance;

            game.state.start(key, clearWorld, clearCache, args);
        }
    }
}