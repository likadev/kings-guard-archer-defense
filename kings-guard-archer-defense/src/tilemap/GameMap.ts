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
        private tilemap: Phaser.Tilemap;
        private heroSpawn: Phaser.Point;
        private kingSpawn: Phaser.Point;
        private collision: Phaser.TilemapLayer;

        constructor(mapName: string) {
            this.game = Game.Instance;
            this.mapName = mapName;

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

        /**
         *  Converts a tile numeric value to pixels.
         */
        public toPixels(x: number|Phaser.Point): number|Phaser.Point {
            if (typeof x === 'number') {
                return x * GameMap.TILE_WIDTH;
            }
            else {
                return x.multiply(GameMap.TILE_WIDTH, GameMap.TILE_HEIGHT);
            }
        }

        /**
         *  Converts a number or point to tile coordinates.
         */
        public fromPixels(num: number|Phaser.Point): number|Phaser.Point {
            if (typeof num === 'number') {
                return (<number>num) / GameMap.TILE_WIDTH;
            }
            else {
                return new Phaser.Point(num.x / GameMap.TILE_WIDTH, num.y / GameMap.TILE_HEIGHT);
            }
            
        }

        /**
         *  Preloads assets. Should be called during the 'preload' Phaser phase.
         */
        public preload(): void {
            var url: string = "assets/maps/" + this.mapName + ".json";
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
        }

        /**
         *  Loads JSON file from the URL built from the map name.
         */
        private loadJsonData(): void {
            this.loaded = false;
            var filename = "assets/maps/" + this.mapName + ".json";

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