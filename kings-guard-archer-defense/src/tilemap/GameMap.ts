// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class GameMap {
        public static TILE_WIDTH: number = 32;
        public static TILE_HEIGHT: number = 32;

        private game: Game;
        private mapName: string;
        private loaded: boolean;
        private tilesetNames: Array<string>;
        private tilesets: Array<Phaser.Tileset>;
        public tilemap: Phaser.Tilemap;
        private heroSpawn: Phaser.Point;
        private kingSpawn: Phaser.Point;
        private collision: Phaser.TilemapLayer;
        public pathfinder: Pathfinding;
        private occupiedGrid: Array<AnimatedSprite>;
        public enemySpawns: Phaser.Point[];

        constructor(mapName: string) {
            this.game = Game.Instance;
            this.mapName = mapName;
            this.enemySpawns = [];
            this.occupiedGrid = [];

            this.loadJsonData();
        }

        /**
         *  Gets the map name.
         */
        public get name(): string {
            return this.mapName;
        }

        /**
         *  Gets whether or not the game map is ready to load it's assets.
         */
        public get ready(): boolean {
            return this.loaded;
        }

        /**
         *  Gets the (x, y) position (in tiles) of the hero spawn point.
         */
        public get heroSpawnPoint(): Phaser.Point {
            return this.heroSpawn;
        }

        /**
         *  Gets the (x, y) position of the king's spawn point.
         */
        public get kingSpawnPoint(): Phaser.Point {
            return this.kingSpawn;
        }

        /**
         *  Gets the collision layer.
         */
        public get collisionLayer(): Phaser.TilemapLayer {
            return this.collision;
        }

        public get width(): number {
            return this.tilemap.width;
        }

        public get widthInPixels(): number {
            return this.tilemap.widthInPixels;
        }

        public get height(): number {
            return this.tilemap.height;
        }

        public get heightInPixels(): number {
            return this.tilemap.heightInPixels;
        }

        /**
         *  Converts a tile numeric value to pixels.
         */
        public toPixels(x: number|Phaser.Point): number|Phaser.Point {
            if (typeof x === 'number') {
                return x * GameMap.TILE_WIDTH;
            }
            else {
                return Phaser.Point.multiply(x, new Phaser.Point(GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT));
            }
        }

        /**
         *  Converts a number or point to tile coordinates.
         */
        public fromPixels(num: number|Phaser.Point): number|Phaser.Point {
            if (typeof num === 'number') {
                return Math.floor((<number>num) / GameMap.TILE_WIDTH);
            }
            else {
                return new Phaser.Point(Math.floor(num.x / GameMap.TILE_WIDTH), Math.floor(num.y / GameMap.TILE_HEIGHT));
            }
        }

        /**
         *  Finds the shortest path from the given point to the given point (in tiles).
         */
        public findPath(from: Phaser.Point, to: Phaser.Point, fullSearch: boolean = false): Phaser.Point[] {
            if (from.x < 0 || from.x >= this.width || from.y < 0 || from.y >= this.height) {
                throw new RangeError("Pathfinding: 'from' coordinate is out of range: (" + from.x + ", " + from.y + ") width=" + this.width + ", height=" + this.height);
            }

            if (to.x < 0 || to.x >= this.width || to.y < 0 || to.y >= this.height) {
                throw new RangeError("Pathfinding: 'to' coordinate is out of range: (" + to.x + ", " + to.y + ")");
            }

            return this.pathfinder.findPath(from, to, fullSearch);
        }

        /**
         *  Preloads assets. Should be called during the 'preload' Phaser phase.
         */
        public preload(): void {
            var url: string = "assets/maps/" + this.mapName + ".json?t=" + Date.now();
            this.game.load.tilemap(this.mapName, url, null, Phaser.Tilemap.TILED_JSON);

            for (var i = 0, l = this.tilesetNames.length; i < l; ++i) {
                var name: string = this.tilesetNames[i];
                var imageUrl: string = "assets/tilesets/" + name + ".png";
                this.game.load.image(name, imageUrl);
            }
        }

        /**
         *  Creates tilemap assets. Should be called during the 'create' Phaser phase.
         */
        public create(): void {
            this.tilemap = this.game.add.tilemap(this.mapName, GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT);
            this.tilesets = this.tilemap.tilesets;

            for (var i = 0, l = this.tilesetNames.length; i < l; ++i) {
                var tilesetName = this.tilesetNames[i];
                this.tilemap.addTilesetImage(tilesetName);
            }

            this.createLayers();

            this.pathfinder = new Pathfinding(this);

            this.occupiedGrid = [];
            var size = this.width * this.height;
            for (i = 0; i < size; ++i) {
                this.occupiedGrid[i] = null;
            }
        }

        /**
         *  Checks if the given tile coordinate is out of bounds.
         */
        public isOutOfBounds(x: number|Phaser.Point, y?: number): boolean {
            var _x, _y;
            if (typeof x === 'number') {
                _x = x;
                _y = y;
            }
            else {
                _x = x.x;
                _y = x.y;
            }

            return (_x < 0 || _y < 0 || _x >= this.width || _y >= this.height);
        }

        /**
         *  Check if the given tile coordinate is a wall.
         */
        public isWall(x: number, y: number): boolean {
            var p: Phaser.Point = <Phaser.Point>this.toPixels(new Phaser.Point(x, y));
            return this.isWallInPixelCoordinates(p.x, p.y);
        }

        /**
         *  Checks if the given pixel coordinate is a wall.
         */
        public isWallInPixelCoordinates(x: number, y: number): boolean {
            var collidingTiles = this.collisionLayer.getTiles(x, y, GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT, true);
            return collidingTiles != null && collidingTiles.length > 0;
        }

        /**
         *  Occupy a tile for yourself.
         */
        public occupy(x: number, y: number, sprite: AnimatedSprite): boolean {
            if (this.isOutOfBounds(x, y) || this.isOccupied(x, y, sprite) || this.isWall(x, y)) {
                return false;
            }

            this.unoccupy(sprite);
            this.occupiedGrid[y * this.width + x] = sprite;
            var tile = this.tilemap.getTile(x, y, this.collisionLayer, true);
            if (tile != null) {
                tile.canCollide = true;
            }

            return true;
        }

        /**
         *  Un-occupy a spot on the map.
         */
        public unoccupy(x: number|AnimatedSprite, y?: number) {
            if (typeof x === 'number') {
                if (!this.isOutOfBounds(x, y)) {
                    this.occupiedGrid[y * this.width + x] = null;
                    var tile = this.tilemap.getTile(x, y, this.collisionLayer, true);
                    if (tile != null) {
                        tile.canCollide = false;
                    }
                }
            }
            else {
                var idx: number = -1;
                while (true) {
                    idx = this.occupiedGrid.indexOf(x);
                    if (idx >= 0) {
                        var sprite = this.occupiedGrid[idx];
                        this.occupiedGrid[idx] = null;
                        var tile = this.tilemap.getTile(Math.floor(sprite.x / GameMap.TILE_WIDTH), Math.floor(sprite.y / GameMap.TILE_HEIGHT), this.collisionLayer, true);
                        if (tile != null) {
                            tile.canCollide = false;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }

        /**
         *  Checks if the given tile is occupied.
         */
        public isOccupied(x: number, y: number, requestor?: AnimatedSprite): boolean {
            if (this.isOutOfBounds(x, y)) {
                return false;
            }

            var idx = y * this.width + x;

            var sprite: Phaser.Sprite = this.occupiedGrid[idx];
            if (sprite == null) {
                return false;
            }

            if (sprite === requestor) {
                return false;
            }

            if (!sprite.alive || !sprite.exists) {
                this.occupiedGrid[idx] = null;
                return false;
            }

            return true;
        }

        public getWeightOfOccupiedTile(x: number, y: number): number {
            if (this.isWall(x, y) || this.isOutOfBounds(x, y)) {
                return 0;
            }

            if (!this.isOccupied(x, y)) {
                return 1;
            }

            var sprite: AnimatedSprite = this.occupiedGrid[y * this.width + x];
            if (sprite != null) {
                return sprite.weight;
            }

            return 1;
        }

        public debugRenderOccupiedGrid() {
            for (var y = 0; y < this.height; ++y) {
                for (var x = 0; x < this.width; ++x) {
                    var sprite: Phaser.Sprite = this.occupiedGrid[y * this.width + x];
                    if (sprite != null) {
                        var rect: Phaser.Rectangle = new Phaser.Rectangle(x * GameMap.TILE_WIDTH, y * GameMap.TILE_HEIGHT, GameMap.TILE_WIDTH,  GameMap.TILE_HEIGHT);
                        this.game.debug.geom(rect, '#0000FF', false);
                    }
                }
            }
        }

        /**
         *  Loads JSON file from the URL built from the map name.
         */
        private loadJsonData(): void {
            this.loaded = false;
            var filename = "assets/maps/" + this.mapName + ".json?t=" + Date.now();

            $.getJSON(filename,(data: any, textStatus: string, jqXHR: JQueryXHR) => {
                this.tilesetNames = new Array<string>();
                var tileSets: Array<any> = data.tilesets;

                for (var i = 0, l = tileSets.length; i < l; ++i) {
                    var tileset = tileSets[i];
                    var name: string = tileset.name;
                    this.tilesetNames.push(name);
                }

                this.loaded = true;
                console.log(data);
            });
        }

        /**
         *  Creates the tileset layers.
         */
        private createLayers(): void {
            for (var i = 0, l = this.tilemap.layers.length; i < l; ++i) {
                var layerData: any = this.tilemap.layers[i];
                var isCollisionLayer = false;
                var isVisible = true;
                if (layerData.properties.hasOwnProperty("collision_layer")) {
                    isCollisionLayer = true;
                    isVisible = false;
                }

                var layer: Phaser.TilemapLayer = this.tilemap.createLayer(layerData.name,
                    layerData.widthInPixels, layerData.heightInPixels);

                layer.visible = isVisible;

                if (isCollisionLayer) {
                    this.collision = layer;
                    var indices: Array<number> = [];
                    var tiles: Phaser.Tile[] = layer.getTiles(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
                    for (var j = 0, k = tiles.length; j < k; ++j) {
                        var tile: Phaser.Tile = tiles[j];
                        if (!this.checkProperty(tile.properties, "can_pass", true)) {
                            tile.canCollide = true;
                            if (indices.indexOf(tile.index) < 0) {
                                this.tilemap.setCollisionByIndex(tile.index, true, layer.index, true);
                                indices.push(tile.index);
                            }
                        }
                        else if (this.checkProperty(tile, "spawn_point")) {
                            this.heroSpawn = new Phaser.Point(tile.x, tile.y);
                        }
                        else if (this.checkProperty(tile, "king_spawn_point")) {
                            this.kingSpawn = new Phaser.Point(tile.x, tile.y);
                        }
                        else if (this.checkProperty(tile, "enemy_spawn")) {
                            this.enemySpawns.push(new Phaser.Point(tile.x, tile.y));
                        }
                    }

                    //this.tilemap.setCollision(indices, true, this.collision);
                }

                layer.resizeWorld();
            }

            this.game.physics.arcade.setBoundsToWorld();
        }

        /**
         *  Checks if a property is set, and if so, if that property is true.
         *  If it is not set, set the default value given (or false) is returned instead. Otherwise, the result is the
         *  parsed boolean value from the property.
         */
        private checkProperty(tile: Phaser.Tile|any, key: string, defaultValue: boolean = false): boolean {
            var props = tile;
            if (tile instanceof Phaser.Tile) {
                props = tile.properties;
            }

            var result: boolean = defaultValue;
            if (props.hasOwnProperty(key)) {
                var value = props[key];
                result = value === true || value === "true" || value === 1 || value === "1";
            }

            return result;
        }
    }
}