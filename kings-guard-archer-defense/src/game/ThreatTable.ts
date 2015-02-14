// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class ThreatTable {
        private _parent: AnimatedSprite;
        private _table: Array<{ sprite: AnimatedSprite; threat: number }>;
        private _highestThreatTarget: AnimatedSprite;

        public highestThreatChanged: Phaser.Signal;

        constructor(parent: AnimatedSprite) {
            this._parent = parent;
            this._table = [];
            this.highestThreatChanged = new Phaser.Signal();

            var info = GameInfo.CurrentGame;
            this.addThreat(info.king, 1);
            this.addThreat(info.hero, 1);
            this.doTableMaintenance();
        }

        /**
         *  Gets the owner of the threat table.
         */
        public get parent(): AnimatedSprite {
            return this._parent;
        }

        /**
         *  
         */
        public addThreat(sprite: AnimatedSprite, threat: number): number {
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
        }

        /**
         *  Remove a target from the threat table.
         */
        public removeThreatTarget(sprite: AnimatedSprite): boolean {
            var removed = false;
            var idx = this.indexOfSpriteInTable(sprite);
            if (idx >= 0) {
                this._table.splice(idx, 1);
                removed = true;
            }

            this.doTableMaintenance();

            return removed;
        }

        /**
         *  Gets the highest threat target in the threat table.
         */
        public getHighestThreatTarget(): AnimatedSprite {
            return this._highestThreatTarget;
        }

        /**
         *  Perform maintenance on the table, such as removing targets who no longer exist.
         */
        private doTableMaintenance(): void {
            var removables: AnimatedSprite[] = [];

            var highestThreatSprite: AnimatedSprite = null;
            var highestThreat = -99999;

            for (var i = 0, l = this._table.length; i < l; ++i) {
                var entry = this._table[i];
                var sprite = entry.sprite;
                if (!sprite.alive || !sprite.exists) {
                    removables.push(sprite);
                }
                else {
                    console.log(entry);
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
        }

        /**
         *  Find the index of the sprite in the table.
         */
        private indexOfSpriteInTable(sprite: AnimatedSprite): number {
            var index = -1;

            for (var i = 0, l = this._table.length; i < l; ++i) {
                var entry = this._table[i];
                if (entry.sprite === sprite) {
                    index = i;
                    break;
                }
            }

            return index;
        }

        /**
         *  Adds a threat target to the table and returns the new index.
         */
        private createThreatTarget(sprite: AnimatedSprite, initialThreat: number = 0): number {
            return this._table.push({
                sprite: sprite,
                threat: initialThreat
            }) - 1;
        }
    }
}