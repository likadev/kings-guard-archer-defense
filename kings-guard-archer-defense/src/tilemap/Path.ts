// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class Path<T> {
        private _path: T[];
        private _idx: number;

        constructor(path: T[]) {
            this.currentPath = path;
        }

        /**
         *  Gets the current working path.
         */
        public get currentPath(): T[] {
            return this._path;
        }

        /**
         *  Sets a new path and resets the index.
         */
        public set currentPath(path: T[]) {
            this._path = path;
            this._idx = -1;
        }

        /**
         *  Sets the index back to it's original state.
         */
        public reset(): void {
            this._idx = -1;
        }

        /**
         *  Gets the number of nodes in this path.
         */
        public get length(): number {
            return this._path != null ? this._path.length : 0;
        }

        /**
         *  Gets the node at the given index.
         */
        public at(idx: number): T {
            return this._path[idx] || null;
        }

        /**
         *  Peek at the next element without adjusting the index.
         */
        public peek(): T {
            return this._path[this._idx + 1] || null;
        }

        /**
         *  Peek at the previous element without adjusting the index.
         */
        public peekBehind(): T {
            return this._path[this._idx - 1] || null;
        }

        /**
         *  Peeks at the last element in ths path.
         */
        public peekLast(): T {
            return this._path[this.length - 1] || null;
        }

        /**
         *  Gets whether or not there is another element in the path.
         */
        public hasNext(): boolean {
            return this._idx + 1 < this.length;
        }

        /**
         *  Gets whether or not there is an element behind us.
         */
        public hasPrev(): boolean {
            return this._idx - 1 >= 0;
        }

        /**
         *  Moves the index forward one step and returns the element at the index.
         */
        public next(): T {
            ++this._idx;
            if (this._idx > this.length) {
                this._idx = this.length;
            }

            return this._path[this._idx] || null;
        }

        /**
         *  Rolls the index back one step and returns the element at the index.
         */
        public prev(): T {
            --this._idx;
            if (this._idx < -1) {
                this._idx = -1;
            }

            return this._path[this._idx] || null;
        }
    }
}