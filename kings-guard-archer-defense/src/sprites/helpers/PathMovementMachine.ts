// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class PathMovementMachine {
        private _parent: AnimatedSprite;
        private _path: Path<Phaser.Rectangle>;

        constructor(parent: AnimatedSprite) {
            this._parent = parent;
            this._path = null;
        }

        public get currentPath(): Path<Phaser.Rectangle> {
            return this._path;
        }

        public set currentPath(path: Path<Phaser.Rectangle>) {
            this._path = path;
        }

        public setCurrentPath(path: Path<Phaser.Point>) {
            this.currentPath = OccupiedGrid.convertToGridPath(path);
        }

        /**
         *  Gets the indices of the next node in the path.
         */
        public getNextGridIndices(): number[]{
            if (this._path == null) {
                return null;
            }

            var rect = this._path.peek();
            if (rect == null) {
                return [];
            }

            return OccupiedGrid.getIndicesOfRect(rect);
        }

        update(): void {

        }

        render(): void {
            var debug = this._parent.game.debug;

            if (this._path != null) {
                for (var i = 0, l = this._path.length; i < l; ++i) {
                    var node = this._path.at(i);
                    debug.geom(node, '#FF3333', false);
                }
            }
        }
    }
} 