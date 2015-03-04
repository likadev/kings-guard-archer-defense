// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.


module KGAD {
    export class ScriptEngine {
        protected game: Phaser.Game;
        protected map: GameMap;
        private _script: Script;
        private _level: string;
        private _enemyKeys: string[];
        private _waveIndex: number;
        private _waveInProgress: boolean;

        constructor(level?: string) {
            this.game = Game.Instance;
            this.map = Game.CurrentMap;
            this._level = level;
            this._enemyKeys = [];
            this._waveIndex = 0;
            this._waveInProgress = false;
        }

        /**
         *  Gets the wave index. 
         */
        public get waveIndex(): number {
            return this._waveIndex;
        }

        /**
         *  Gets whether or not there is a wave currently operating.
         */
        public get waveInProgress(): boolean {
            return this._waveInProgress;
        }

        /**
         *  Preloads the script engine data.
         */
        public preload(level?: string) {
            this._level = level || this._level;

            this.game.load.json('scripts', 'assets/maps/scripts.json');
        }

        /**
         *  Creates the script engine data from the preloaded JSON script.
         */
        public create(level?: string) {
            this._level = level || this._level;
            if (!this._level) {
                throw new Error("No level specified!");
            }

            var json: any = this.game.cache.getJSON('scripts');
            if (!json.scripts) {
                throw new Error("No 'scripts' element in JSON: " + JSON.stringify(json, null, 2));
            }

            var scripts: Scripts = json.scripts;
            var script: Script = scripts[this._level];
            if (!script) {
                throw new Error("Level not found in script engine: " + this._level);
            }

            this._script = this.fillDefaults(script);
            this._waveIndex = 0;

            console.log('script created for level ' + this._level);
        }

        /**
         *  Gets all enemy keys, which can be useful for loading sprite assets.
         */
        public getEnemyKeys(): string[]{
            return this._enemyKeys;
        }

        /**
         *  Gets whether or not there is a next wave that can be invoked via nextWave().
         */
        public hasNextWave(): boolean {
            return this._waveIndex < this._script.waves.length;
        }

        /**
         *  Starts the next wave. If the next wave cannot be started or a wave is already running, this method
         *  does nothing and returns false. If the wave starts successfully, true is returned.
         */
        public nextWave(enemySpawner: (enemyType: string, position?: Phaser.Point) => any): boolean {
            if (this._waveInProgress || !this.hasNextWave()) {
                return false;
            }

            this._waveInProgress = true;
            var wave: Wave = this._script.waves[this._waveIndex++];
            if (!wave) {
                return false;
            }
            var timer = this.game.time.events;

            var availableEnemyTypes: string[] = [];
            var enemyTypeIdx = 0;
            var totalDelay = 0;

            var getNextEnemyType: () => string = () => {
                var len = availableEnemyTypes.length;
                if (len === 0) {
                    return null;
                }
                else if (enemyTypeIdx >= len) {
                    enemyTypeIdx = 0;
                }

                return availableEnemyTypes[enemyTypeIdx++];
            };

            var spawnEnemy: () => any = null;
            spawnEnemy = () => {
                var nextEnemyType: string = getNextEnemyType();
                if (!nextEnemyType) {
                    this.stopWave();
                    return;
                }

                var point: Phaser.Point = null;
                if (seq.spawnPointName) {
                    // TODO
                }

                enemySpawner(nextEnemyType, point);
            };

            var table: {
                delay: number;
                enemyType?: string;
                position?: Phaser.Point;
            }[] = [];

            for (var i = 0, l = wave.sequence.length; i < l; ++i) {
                var seq = wave.sequence[i];
                var times: number = seq.times;
                var every: number = seq.every;

                table.push({
                    delay: seq.delay
                });

                this.addEnemyTypes(seq.addEnemyTypes, availableEnemyTypes);
                this.removeEnemyTypes(seq.removeEnemyTypes, availableEnemyTypes);

                for (var j = 0; j < times; ++j) {
                    var position: Phaser.Point = null;
                    if (seq.spawnPointName) {
                        // TODO
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

            timer.add(totalDelay,() => {
                this.stopWave();
            }, this);

            return true;
        }

        /**
         *  Stops the current wave.
         */
        private stopWave(): void {
            this._waveInProgress = false;
        }

        /**
         *  Add enemy types to the given list of available types.
         */
        private addEnemyTypes(types: EnemyType[], availableTypes: string[]) {
            for (var j = 0, m = types.length; j < m; ++j) {
                var enemyType = types[j];
                var priority = enemyType.priority;
                while (priority > 0) {
                    availableTypes.push(enemyType.key);

                    --priority;
                }
            }
        }

        /**
         *  Remove enemy types from the given list of available types.
         */
        private removeEnemyTypes(types: string[], availableTypes: string[]) {
            for (var j = 0, m = types.length; j < m; ++j) {
                var key = types[j];
                var idx = -1;
                while ((idx = $.inArray(key, availableTypes)) !== -1) {
                    availableTypes.splice(idx, 1);
                }
            }
        }

        /**
         *  Validate the script internals and set default values for missing data.
         */
        private fillDefaults(script: Script): Script {
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

                                AnimationLoader.load(enemyType.key,(spr) => { }, Enemy);
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
        }
    }
}