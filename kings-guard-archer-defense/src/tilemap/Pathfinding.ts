// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../../definitions/astar.d.ts" />

module KGAD {
    export class Pathfinding {
        private map: GameMap;
        private graph: Graph;
        private size: number;

        constructor(map: GameMap) {
            this.map = map;
            
            this.createGrid();
        }

        /**
         *  Attempts to find the shortest path from one point to another.
         */
        public findPath(from: Phaser.Point, to: Phaser.Point, fullSearch: boolean = false): Phaser.Point[] {
            this.createGrid();
            var start = this.graph.grid[from.x][from.y];
            var end = this.graph.grid[to.x][to.y];

            if (!fullSearch) {
                var miniGrid = this.createMiniGrid(from, to);

                var path: GridNode[] = astar.search(miniGrid, start, end);
            }

            if (fullSearch || path.length === 0) {
                path = astar.search(this.graph, start, end);
            }

            if (path.length === 0) {
                //console.error('no path between ' + from.toString() + ' and ' + to.toString());
            }

            var result: Phaser.Point[] = [];

            for (var i = 0, l = path.length; i < l; ++i) {
                var node: GridNode = path[i];
                result.push(new Phaser.Point(node.x, node.y));
            }

            return result;
        }

        /**
         *  Gets the width of the grid (in tiles).
         */
        public get gridWidth(): number {
            return this.map.width;
        }

        /**
         *  Gets the height of the grid (in tiles).
         */
        public get gridHeight(): number {
            return this.map.height;
        }

        /**
         *  Gets the pathfinding node at the given (x, y) coordinate.
         */
        public getNodeAt(x: number, y: number): GridNode {
            var idx = y * this.gridWidth + x;
            if (idx < 0 || idx >= this.size) {
                return null;
            }

            return this.graph.grid[x][y];
        }

        private createMiniGrid(from: Phaser.Point, to: Phaser.Point): Graph {
            var minX = Math.min(from.x, to.x);
            var minY = Math.min(from.y, to.y);
            var maxX = Math.max(from.x, to.x);
            var maxY = Math.max(from.y, to.y);

            var rect = new Phaser.Rectangle(minX, minY, maxX - minX, maxY - minY);
            var width: number = rect.width;
            var height: number = rect.height;
            var size: number = width * height;

            var grid = [];

            for (var x = minX, j = 0; x < maxX; ++x, ++j) {
                grid[j] = [];
                for (var y = minY, k = 0; y < maxY; ++y, ++k) {
                    grid[j][k] = this.graph.grid[j][k].weight;
                }
            }

            return new Graph(grid, { diagonal: false });
        }

        /**
         *  Creates the internal representation of the grid.
         */
        private createGrid(): void {
            var width: number = this.gridWidth;
            var height: number = this.gridHeight;
            var size: number = width * height;
            var collisionTiles: Phaser.Tile[] = this.map.collisionLayer.getTiles(0, 0, this.map.widthInPixels, this.map.heightInPixels);

            var tilemap = this.map.tilemap;
            var collisionLayer = this.map.collisionLayer;

            this.size = size;

            var grid = [];
            
            for (var x = 0; x < width; ++x) {
                grid[x] = [];
                for (var y = 0; y < height; ++y) {
                    var weight = OccupiedGrid.getWeightOfInTileCoordinates(x, y);
                    grid[x][y] = weight;
                }
            }

            this.graph = new Graph(grid, { diagonal: false });
        }

        /**
         *  Updates the grid with the latest wall/occupation information.
         */
        private updateGrid(): void {
            var w = this.gridWidth,
                h = this.gridHeight;

            for (var x = 0; x < w; ++x) {
                for (var y = 0; y < h; ++y) {
                    var weight: number = OccupiedGrid.getWeightOfInTileCoordinates(x, y);
                    this.graph.grid[x][y].weight = weight;
                }
            }
        }

        public render() {
            //return;

            var game = Game.Instance;
            /*for (var x = 0; x < this.gridWidth; ++x) {
                for (var y = 0; y < this.gridHeight; ++y) {
                    game.debug.text(this.graph.grid[x][y].x + "," + this.graph.grid[x][y].y, x * 32, y * 32 + 32, '#FFFFFF', '10px Courier New');
                    game.debug.text(this.graph.grid[x][y].weight.toString(), x * 32, y * 32 - 10, '#FFFFFF', '10px Courier New');
                }
            }*/
        }
    }
}