// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export interface Reservation {
        sprite: AnimatedSprite;
        indices: number[];
    }

    export class OccupiedGrid {
        public static get NODE_SIZE() { return 16; } // 16x16

        private static _map: GameMap;
        private static _grid: Array<AnimatedSprite>;
        private static _reservations: Array<Reservation>;
        private static _width: number;
        private static _height: number;

        /**
         *  Gets the current width of the occupied grid.
         */
        public static get width(): number {
            return OccupiedGrid._width;
        }

        /**
         *  Gets the current height of the occupied grid.
         */
        public static get height(): number {
            return OccupiedGrid._height;
        }

        /**
         *  Gets the current GameMap instance.
         */
        public static get currentMap(): GameMap {
            return OccupiedGrid._map;
        }

        /**
         *  Sets the current GameMap instance. Changing this value will reset the grid.
         */
        public static set currentMap(map: GameMap) {
            OccupiedGrid._map = map;

            OccupiedGrid.reset();
        }

        /**
         *  Gets all occupants within the pixel rectangle.
         */
        public static getOccupantsInBounds(bounds: { x: number; y: number; width: number; height: number; }): AnimatedSprite[] {
            var top = new Phaser.Line(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y);
            var left = new Phaser.Line(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
            var bottom = new Phaser.Line(bounds.x, bounds.y + bounds.height, bounds.x + bounds.width, bounds.y + bounds.height);
            var right = new Phaser.Line(bounds.x + bounds.width, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height);

            var lines = [
                top,
                left,
                bottom,
                right
            ];

            var occupants: AnimatedSprite[] = [];

            for (var i = 0, l = lines.length; i < l; ++i) {
                var line = lines[i];
                var coords: { x: number; y: number }[] = [];
                line.coordinatesOnLine(OccupiedGrid.NODE_SIZE / 2, coords);

                for (var j = 0, m = coords.length; j < m; ++j) {
                    var coord = coords[j];
                    var idx = OccupiedGrid.getIndexAtPixelCoordinate(coord.x, coord.y);
                    var occupant = OccupiedGrid._grid[idx] || null;
                    if (occupant != null && $.inArray(occupant, occupants) < 0) {
                        occupants.push(occupant);
                    }
                }
            }

            return occupants;
        }

        /**
         *  Checks if the cell at map tile coordinate (x, y) is occupied.
         */
        public static isOccupiedInTiles(x: number|Phaser.Point, y?: number): boolean {
            var p: Phaser.Point = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            p = new Phaser.Point(p.x * GameMap.TILE_WIDTH, p.y * GameMap.TILE_HEIGHT)
                .divide(OccupiedGrid.NODE_SIZE, OccupiedGrid.NODE_SIZE);

            return OccupiedGrid.isOccupied(p.x, p.y);
        }

        /**
         *  Checks if the cell at pixel coordinate (x, y) is occupied.
         */
        public static isOccupiedInPixels(x: number|Phaser.Point, y?: number): boolean {
            var p: Phaser.Point = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }

            return OccupiedGrid.isOccupied(p);
        }

        /**
         *  Checks if the cell at tile coordinate (x, y) is occupied.
         */
        public static isOccupied(x: number|Phaser.Point, y?: number): boolean {
            var p: Phaser.Point = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            var idx = p.y * OccupiedGrid.width + p.x;
            if (idx < 0 || idx >= OccupiedGrid._grid.length) {
                return true;
            }

            var occupant = OccupiedGrid._grid[idx];
            return occupant != null;
        }

        /**
         *  Gets the occupant of the (x, y) map tile coordinate.
         */
        public static getOccupantOfInTiles(x: number|Phaser.Point, y?: number): AnimatedSprite {
            var p: Phaser.Point = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            p = new Phaser.Point(p.x * GameMap.TILE_WIDTH, p.y * GameMap.TILE_HEIGHT)
                .divide(OccupiedGrid.NODE_SIZE, OccupiedGrid.NODE_SIZE);

            return OccupiedGrid.getOccupantOf(p);
        }

        /**
         *  Gets the occupant of the (x, y) pixel coordinate.
         */
        public static getOccupantOfInPixels(x: number|Phaser.Point, y?: number): AnimatedSprite {
            var p: Phaser.Point = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }

            return OccupiedGrid.getOccupantOf(p);
        }

        /**
         *  Gets the occupant of the (x, y) tile coordinate.
         */
        public static getOccupantOf(x: number|Phaser.Point, y?: number): AnimatedSprite {
            var p: Phaser.Point = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            var idx = p.y * OccupiedGrid.width + p.x;
            if (idx < 0 || idx >= OccupiedGrid._grid.length) {
                return null;
            }

            var occupant = OccupiedGrid._grid[idx];
            return occupant;
        }

        /**
         *  Gets the pathfinding weight of the given (x, y) pixel coordinate.
         */
        public static getWeightOfInPixelCoordinates(x: number|Phaser.Point, y?: number): number {
            var p: Phaser.Point = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }

            return OccupiedGrid.getWeightOf(p);
        }

        /**
         *  Gets the weight of the given (x, y) map tile coordinate.
         */
        public static getWeightOfInTileCoordinates(x: number|Phaser.Point, y?: number): number {
            var p: Phaser.Point = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            p = new Phaser.Point(p.x * GameMap.TILE_WIDTH, p.y * GameMap.TILE_HEIGHT)
                .divide(OccupiedGrid.NODE_SIZE, OccupiedGrid.NODE_SIZE);

            return OccupiedGrid.getWeightOf(p);
        }

        /**
         *  Gets the weight of the given (x, y) grid tile coordinate.
         */
        public static getWeightOf(x: number|Phaser.Point, y?: number): number {
            var p: Phaser.Point = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            var weight = 1;
            var occupant = OccupiedGrid.getOccupantOf(p);
            if (occupant == null) {
                var map = OccupiedGrid._map;
                var tileCoordinate = new Phaser.Point(p.x * OccupiedGrid.NODE_SIZE, p.y * OccupiedGrid.NODE_SIZE);
                if (map.isWallInPixelCoordinates(tileCoordinate.x, tileCoordinate.y)) {
                    weight = 0;
                }
            }
            else {
                weight = occupant.weight;
            }

            return weight;
        }

        /**
         *  Gets the index of the (x, y) pixel coordinate. If it's out of bounds, -1 is returned.
         */
        public static getIndexAtPixelCoordinate(x: number, y: number): number {
            var map = OccupiedGrid._map;
            var _tX = Math.floor(x / GameMap.TILE_WIDTH);
            var _tY = Math.floor(y / GameMap.TILE_HEIGHT);
            if (map.isWall(_tX, _tY)) {
                return -1;
            }

            var size = OccupiedGrid.NODE_SIZE;
            var _x = Math.floor(x / size);
            var _y = Math.floor(y / size);

            var idx = _y * OccupiedGrid.width + _x;
            if (idx >= OccupiedGrid._grid.length || idx < 0) {
                return -1;
            }

            return idx;
        }

        /**
         *  Gets the (x, y, width, height) bounds of a sprite.
         */
        public static getBoundsOfSprite(sprite: AnimatedSprite): { x: number; y: number; width: number; height: number; } {
            var bounds = OccupiedGrid.getBoundsAtCenter(sprite.position);

            return bounds;
        }

        /**
         *  Returns an array containing all grid indices that a sprite currently occupies.
         */
        public static getIndicesOfSprite(sprite: AnimatedSprite, allowNegativeOne = false): number[]{
            var bounds = OccupiedGrid.getBoundsOfSprite(sprite);

            return OccupiedGrid.getIndicesOfRect(bounds, allowNegativeOne);
        }

        /**
         *  Returns an array containing all grid indices that a rectangle occupies.
         */
        public static getIndicesOfRect(rect: { x: number; y: number; width: number; height: number; }, allowNegativeOne = false): number[] {
            var result: number[] = [];
            var indices: number[] = [];

            indices[0] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x, rect.y);
            indices[1] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x + rect.width, rect.y);
            indices[2] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x + rect.width, rect.y + rect.height);
            indices[3] = OccupiedGrid.getIndexAtPixelCoordinate(rect.x, rect.y + rect.height);

            for (var i = 0; i < 4; ++i) {
                var idx = indices[i];
                if (idx === -1 && !allowNegativeOne) {
                    continue;
                }

                if ($.inArray(idx, result) < 0) {
                    result.push(idx);
                }
            }

            return result;
        }

        /**
         *  Resets the grid.
         */
        public static reset(): void {
            var map = OccupiedGrid._map;
            var w = map.width * 2;
            var h = map.height * 2;
            var size = w * h;
            var grid: Array<AnimatedSprite> = [];

            for (var i = 0; i < size; ++i) {
                grid.push(null);
            }

            OccupiedGrid._grid = grid;
            OccupiedGrid._reservations = [];
            OccupiedGrid._width = w;
            OccupiedGrid._height = h;
        }

        /**
         *  Removes a sprite from the grid.
         */
        public static remove(sprite: AnimatedSprite): boolean {
            var removed = false;
            var idx = -1;
            var grid = OccupiedGrid._grid;

            idx = $.inArray(sprite, grid);
            while (idx >= 0) {
                grid[idx] = null;
                removed = true;

                idx = $.inArray(sprite, grid, idx);
            }

            return removed;
        }

        /**
         *  Checks if the given sprite can occupy the given (x, y) map tile coordinate.
         */
        public static canOccupyInTiles(sprite: AnimatedSprite, x: number|Phaser.Point, y?: number, collisions: AnimatedSprite[] = []): boolean {
            var p: Phaser.Point = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(x * GameMap.TILE_WIDTH, y * GameMap.TILE_HEIGHT);
            }
            else {
                p = new Phaser.Point(x.x * GameMap.TILE_WIDTH, x.y * GameMap.TILE_HEIGHT);
            }

            return OccupiedGrid.canOccupyInPixels(sprite, p, null, collisions);
        }

        /**
         *  Checks if the given sprite can occupy the given (x, y) pixel coordinate.
         */
        public static canOccupyInPixels(sprite: AnimatedSprite, x: number|Phaser.Point, y?: number, collisions: AnimatedSprite[] = []): boolean {
            var p: Phaser.Point = null;
            var nodeSize = OccupiedGrid.NODE_SIZE;
            if (typeof x === 'number') {
                p = new Phaser.Point(Math.floor(x / nodeSize), Math.floor(y / nodeSize));
            }
            else {
                p = new Phaser.Point(Math.floor(x.x / nodeSize), Math.floor(x.y / nodeSize));
            }

            return OccupiedGrid.canOccupy(sprite, p, null, collisions);
        }

        /**
         *  Checks if the given sprite can occupy the given (x, y) tile coordinate.
         */
        public static canOccupy(sprite: AnimatedSprite, x: number|Phaser.Point, y?: number, collisions: AnimatedSprite[] = []): boolean {
            var p: Phaser.Point = null;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            var indices: number[];
            if (sprite == null) {
                var pixelPos = new Phaser.Point(p.x * OccupiedGrid.NODE_SIZE, p.y * OccupiedGrid.NODE_SIZE);
                indices = OccupiedGrid.getIndicesOfRect(OccupiedGrid.getBoundsAtCenter(pixelPos), true);
            }
            else {
                indices = OccupiedGrid.getIndicesOfSprite(sprite, true);
            }

            if ($.inArray(-1, indices) >= 0) {
                return false;
            }

            var grid = OccupiedGrid._grid;
            for (var i = 0, l = indices.length; i < l; ++i) {
                var idx = indices[i];
                var occupant = grid[idx];
                if (occupant != null) {
                    if (sprite == null || occupant !== sprite) {
                        collisions.push(occupant);
                        return false;
                    }
                }
            }

            return true;
        }

        /**
         *  Gets the collision bounds for a sprite at the given point.
         */
        public static getBoundsAtCenter(x: number|Phaser.Point, y?: number): { x: number; y: number; width: number; height: number; } {
            var p: Phaser.Point;
            if (typeof x === 'number') {
                p = new Phaser.Point(x, y);
            }
            else {
                p = x;
            }

            return {
                x: p.x - 8,
                y: p.y - 8,
                width: 16,
                height: 16,
            };
        }

        /**
         *  Reserves a spot for our sprite in the near future.
         */
        public static reserve(sprite: AnimatedSprite, position: Phaser.Point): boolean {
            var savePosition = sprite.position;
            sprite.position = position;
            var indices = OccupiedGrid.getIndicesOfSprite(sprite);
            sprite.position = savePosition;

            if ($.inArray(-1, indices) < 0) {
                return false;
            }

            var grid = OccupiedGrid._grid;
            for (var i = 0, l = indices.length; i < l; ++i) {
                var idx = indices[i];
                var occupant = grid[idx];
                if (occupant != null && occupant !== sprite) {
                    return false;
                }

                var reservedBy = OccupiedGrid.getReservationForIndex(idx);
                if (reservedBy != null && reservedBy !== sprite) {
                    return false;
                }
            }

            var reservation = {
                sprite: sprite,
                indices: indices
            };

            OccupiedGrid._reservations.push(reservation);

            return true;
        }

        /**
         *  Gets who, if anyone, has reserved an index.
         */
        public static getReservationForIndex(index: number): AnimatedSprite {
            var who: AnimatedSprite = null;
            var cleanup: Reservation[] = [];
            var reservations = OccupiedGrid._reservations;

            for (var i = 0, l = reservations.length; i < l; ++i) {
                var reservation = reservations[i];
                var sprite = reservation.sprite;
                if (!sprite.alive || !sprite.exists || sprite.health <= 0) {
                    cleanup.push(reservation);
                }
                else if ($.inArray(index, reservation.indices)) {
                    who = reservation.sprite;
                    break;
                }
            }

            for (var j = 0, k = cleanup.length; j < k; ++j) {
                OccupiedGrid._reservations.splice($.inArray(cleanup[j], reservations), 1);
            }

            return who;
        }

        /**
         *  Gets all reservations for any indices.
         */
        public static getReservationsForIndices(indices: number[]): AnimatedSprite[]{
            var sprites: AnimatedSprite[] = [];

            for (var i = 0, l = indices.length; i < l; ++i) {
                var idx = indices[i];
                sprites.push(OccupiedGrid.getReservationForIndex(idx));
            }

            return sprites;
        }

        /**
         *  Remove the given indices/reservations.
         */
        public static removeReservations(sprite: AnimatedSprite, indices?: number[]) {
            var reservations = OccupiedGrid._reservations;
            var cleanup: Reservation[] = [];

            for (var i = 0, l = reservations.length; i < l; ++i) {
                var reservation = reservations[i];
                if (reservation.sprite === sprite) {
                    if (indices) {
                        for (var j = 0, m = indices.length; j < m; ++j) {
                            var idx = indices[j];
                            var reservationIdx = $.inArray(idx, reservation.indices);
                            if (reservationIdx >= 0) {
                                reservation.indices.splice(reservationIdx, 1);
                            }
                        }
                    }
                    else {
                        reservation.indices = [];
                    }
                }

                if (reservation.indices.length === 0) {
                    cleanup.push(reservation);
                }
            }

            for (i = 0, l = cleanup.length; i < l; ++i) {
                reservations.splice($.inArray(cleanup[i], reservations), 1);
            }
        }

        /**
         *  Converts a pathfinding path generated for a 32x32 tilemap and 
         */
        public static convertToGridPath(path: Path<Phaser.Point>): Path<Phaser.Rectangle> {
            var result: Phaser.Rectangle[] = [];
            var w = GameMap.TILE_WIDTH;
            var h = GameMap.TILE_HEIGHT;
            var n = OccupiedGrid.NODE_SIZE;
            var game = Game.Instance;
            var map = Game.CurrentMap;

            if (path.length === 0) {
                return new Path<Phaser.Rectangle>(result);
            }
            
            var first = <Phaser.Point>map.toPixels(path.next());

            result.push(new Phaser.Rectangle(first.x, first.y, w, h));

            while (path.hasNext()) {
                var node1 = <Phaser.Point>map.toPixels(path.next());
                var node2 = path.peek();

                result.push(new Phaser.Rectangle(node1.x, node1.y, w, h));

                if (node2 != null) {
                    node2 = <Phaser.Point>map.toPixels(node2);
                    var angle = game.physics.arcade.angleBetween(node1, node2);
                    var distance = Phaser.Point.distance(node1, node2);
                    var xDiff = Math.cos(angle) * (distance / 2);
                    var yDiff = Math.sin(angle) * (distance / 2);
                    result.push(new Phaser.Rectangle(node1.x + xDiff, node1.y + yDiff, w, h));
                }
            }

            return new Path<Phaser.Rectangle>(result);
        }

        /**
         *  Adds a sprite as the occupant of the grid.
         */
        public static add(sprite: AnimatedSprite): boolean {
            if (!sprite.alive || !sprite.exists || sprite.health <= 0) {
                OccupiedGrid.removeReservations(sprite);
                OccupiedGrid.remove(sprite);
                return false;
            }
            
            OccupiedGrid.remove(sprite);

            var indices: number[] = OccupiedGrid.getIndicesOfSprite(sprite);
            var reservations = OccupiedGrid.getReservationsForIndices(indices);

            for (var k = 0, m = reservations.length; k < m; ++k) {
                var reservation = reservations[k];
                if (reservation != null && reservation !== sprite) {
                    return false;
                }
            }

            OccupiedGrid.removeReservations(sprite, indices);

            for (var j = 0, l = indices.length; j < l; ++j) {
                var idx = indices[j];
                if (idx !== -1) {
                    OccupiedGrid._grid[idx] = sprite;
                }
            }

            return true;
        }

        /**
         *  Loop through each occupant.
         */
        public static forEach(callback: (sprite: AnimatedSprite, index: number) => any, moreThanOnce: boolean = false) {
            var grid = OccupiedGrid._grid;
            var size = OccupiedGrid.width * OccupiedGrid.height;

            var processed: AnimatedSprite[] = [];

            for (var i = 0; i < size; ++i) {
                var occupant = grid[i];
                if (occupant != null && $.inArray(occupant, processed) < 0) {
                    if (callback(occupant, i) === false) {
                        break;
                    }

                    if (!moreThanOnce) {
                        processed.push(occupant);
                    }
                }
            }
        }

        /**
         *  Update the occupied grid based on the positions of the sprites.
         */
        public static update(sprite?: AnimatedSprite): void {
            if (sprite == null) {
                OccupiedGrid.forEach((sprite, idx) => {
                    OccupiedGrid.add(sprite);
                });
            }
            else {
                OccupiedGrid.add(sprite);
            }
        }

        /**
         *  Render the occupants of the grid as squares (debug).
         */
        public static render(): void {
            var map = OccupiedGrid._map;
            var debug = Game.Instance.debug;
            var w = OccupiedGrid._width;
            var h = OccupiedGrid._height;
            var nodeSize = OccupiedGrid.NODE_SIZE;

            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    var occupant = OccupiedGrid.getOccupantOf(x, y);
                    if (occupant != null) {
                        var pixelX = x * nodeSize;
                        var pixelY = y * nodeSize;
                        debug.geom(new Phaser.Rectangle(pixelX, pixelY, nodeSize, nodeSize), '#FF6666', false);
                    }

                    /*var tileX = Math.floor((x * nodeSize) / GameMap.TILE_WIDTH);
                    var tileY = Math.floor((y * nodeSize) / GameMap.TILE_HEIGHT);
                    
                    if (map.isWall(tileX, tileY)) {
                        debug.geom(new Phaser.Rectangle(x * nodeSize, y * nodeSize, nodeSize, nodeSize), '#FFCCCC', false);
                    }*/
                }
            }
        }
    }
}
