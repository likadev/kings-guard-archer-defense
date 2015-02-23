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
         *  Gets the projectile manager.
         */
        public static get Projectiles(): ProjectileManager {
            return this.Simulation == null ? null : this.Simulation.projectiles;
        }

        constructor(width: number, height: number, container: string) {
            super(width, height, Phaser.AUTO, container);

            if (Game.instance != null) {
                throw Error('Cannot create more than one \'Game\' instance!');
            }

            Game.instance = this;

            var states = new States();
            states.setUpStates();
            states.switchTo(States.Boot);
        }
    }
}

window.onload = () => {
    try {
        $('#content').html('');
        var game = new KGAD.Game(640, 640, 'content');
    }
    finally {

    }
};