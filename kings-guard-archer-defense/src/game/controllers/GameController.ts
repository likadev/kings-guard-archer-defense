// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameControllerActivator<T> {
        constructor(private typ) { }

        getNew(children: T[]): T {
            return new this.typ(children);
        }
    }

    export class GameController {
        private static _current: GameController = null;
        private static _controllers: collections.Dictionary<string, GameController> = new collections.Dictionary<string, GameController>();
        protected context: GameContext;

        constructor(public children: GameController[] = [], public parent?: GameController) {
        }

        public static get current(): GameController {
            return this._current;
        }

        public static set current(controller: GameController) {
            if (this._current) {
                this._current.destroy();
            }

            if (controller) {
                controller.init(Game.Context);
                controller.create();
            }

            this._current = controller;
        }

        public get done(): boolean {
            return this.context['gameComplete'];
        }

        public set done(_done: boolean) {
            this.context['gameComplete'] = _done;
        }

        public get actors(): Actors {
            return this.context['actors'];
        }

        public get script(): ScriptEngine {
            return this.context['script'];
        }

        public get hero(): Hero {
            return this.context['actors'].hero;
        }

        public get king(): King {
            return this.context['actors'].king;
        }

        public get mercenaries(): Mercenary[] {
            return this.actors.mercenaries;
        }

        public get enemies(): Enemy[] {
            return this.actors.enemies;
        }

        public get game(): Game {
            return Game.Instance;
        }

        public get map(): GameMap {
            return Game.CurrentMap;
        }

        public get world(): Phaser.World {
            return this.game.world;
        }

        public get camera(): Phaser.Camera {
            return this.game.camera;
        }

        public get skillChallengeMode(): boolean {
            return !!this.context['skillChallengeMode'];
        }

        public get projectiles(): ProjectileManager {
            return this.context['projectiles'];
        }

        public init(context: GameContext) {
            this.context = context;

            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].init(context);
            }
        }

        public preload() {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].preload();
            }
        }

        public create() {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].create();
            }
        }

        public update() {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].update();
            }
        }

        public render() {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].render();
            }
        }

        public destroy() {
            for (var i = 0, l = this.children.length; i < l; ++i) {
                this.children[i].destroy();
            }
        }

        public static switchTo(name: string) {
            if (GameController._controllers.containsKey(name)) {
                var controller = GameController._controllers.getValue(name);

                GameController.current = controller;
            }
        }

        public static createController<T>(name: string, typ: T, children: T[] = []) {
            var controller: any = new GameControllerActivator<T>(typ).getNew(children);
            for (var i = 0, l = children.length; i < l; ++i) {
                (<any>children[i]).parent = controller;
            }

            GameController._controllers.setValue(name, controller);

            return controller;
        }

        public static preload() {
            GameController._controllers.forEach((key, value) => {
                value.preload();
            });

            Game.Instance.load.start();
        }

        public static destroyControllers(destroy: boolean = true) {
            if (destroy) {
                GameController._controllers.forEach((key, value) => {
                    value.destroy();
                });
            }

            GameController._controllers.clear();
            GameController.current = null;
        }
    }
}