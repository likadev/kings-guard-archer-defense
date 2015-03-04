// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameSimulationState extends Phaser.State {
        private map: GameMap;
        private script: ScriptEngine;

        public actors: Actors;
        public projectiles: ProjectileManager;
        private waveInProgress: boolean;
        public context: GameContext;

        private skillChallengeMode: boolean;
        private createKing: boolean;

        constructor() {
            super();
        }

        public get done(): boolean {
            return (this.context != null ? !!this.context['gameComplete'] : false);
        }

        public set done(_done: boolean) {
            this.context['gameComplete'] = _done;
        }

        init(args: any[]) {
            Game.Simulation = this;

            if (args[0] instanceof GameContext) {
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
                this.projectiles = new ProjectileManager();
            }
        }

        preload(): void {
            if (!this.actors) {
                this.actors = new Actors(this.game, this.map);
            }
        }

        create(): void {
            if (this.createKing) {
                this.map.create();
                this.actors.createKing();
                this.actors.createHero();
            }

            this.context = new GameContext({
                actors: this.actors,
                game: Game.Instance,
                map: Game.CurrentMap,
                grid: OccupiedGrid,
                projectiles: this.projectiles,
                script: this.script,
                skillChallengeMode: this.skillChallengeMode,
                gameComplete: this.done
            });

            GameController.destroyControllers(false);

            var simulationChildren = [new SkillChallengeController()];
            var firstController = GameController.createController<SimulationController>('SimulationController', <any>SimulationController, <any>simulationChildren);
            GameController.createController('PrepareDefenseController', PrepareDefenseController);

            GameController.current = firstController;
        }

        update(): void {
            if (this.done || GameController.current == null) {
                this.switchStates(States.Boot, true, false);
                return;
            }

            this.sortSprites();

            GameController.current.update();
        }

        render(): void {
            if (!this.done && GameController.current != null) {
                GameController.current.render();
            }
        }

        /**
         *  Manually sort the world sprites by their 'y' index. This relies on being called repeatedly (once per frame) in order
         * to fully sort the sprites and also to make sure they are sorted by their 'y' position correctly.
         */
        private sortSprites() {
            var children = this.world.children,
                len: number = children.length;

            if (this.done) {
                return;
            }

            // TODO: we should avoid doing this so often
            for (var i = 0; i < len; ++i) {
                var child1 = children[i];
                if (child1 instanceof Phaser.Sprite) {
                    var y1 = child1.y;
                    for (var j = i + 1; j < len; ++j) {
                        var child2 = children[j];
                        if (child2 instanceof Phaser.Sprite) {
                            var y2 = child2.y;

                            var renderPriority1 = (<any>child1).renderPriority || 0;
                            var renderPriority2 = (<any>child2).renderPriority || 0;

                            if (renderPriority2 < renderPriority1) {
                                children[i] = child2;
                                children[j] = child1;
                                break;
                            }
                            else if (renderPriority1 === renderPriority2 && y2 < y1) {
                                children[i] = child2;
                                children[j] = child1;
                                break;
                            }
                        }
                    }
                }
            }
        }

        /**
         *  Switch to another state, giving our game context to the target state.
         */
        private switchStates(state: string, clearWorld = false, clearCache = false) {
            if (clearWorld) {
                GameController.current = null;
                this.context = null;
                this.actors.destroy(true);
                this.actors = null;
            }

            this.game.state.start(state, clearWorld, clearCache, this.context);
        }

        private switchControllers(controller: GameController) {
            GameController.current = controller;
        }
    }
}