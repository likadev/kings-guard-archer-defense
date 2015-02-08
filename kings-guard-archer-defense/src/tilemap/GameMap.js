// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
var KGAD;
(function (KGAD) {
    var GameMap = (function () {
        function GameMap(mapName) {
            this.game = KGAD.Game.Instance;
            this.mapName = mapName;

            this.loadJsonData();
        }
        Object.defineProperty(GameMap.prototype, "name", {
            /**
            *  Gets the map name.
            */
            get: function () {
                return this.mapName;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(GameMap.prototype, "ready", {
            /**
            *  Gets whether or not the game map is ready to load it's assets.
            */
            get: function () {
                return this.loaded;
            },
            enumerable: true,
            configurable: true
        });

        /**
        *  Preloads assets. Should be called during the 'preload' Phaser phase.
        */
        GameMap.prototype.preload = function () {
            var url = "assets/maps/" + this.mapName + ".json";
            this.game.load.tilemap(this.mapName, url, null, Phaser.Tilemap.TILED_JSON);

            for (var i = 0, l = this.tilesetNames.length; i < l; ++i) {
                var name = this.tilesetNames[i];
                var imageUrl = "assets/tilesets/" + name + ".png";
                this.game.load.image(name, imageUrl);
            }
        };

        /**
        *  Creates tilemap assets. Should be called during the 'create' Phaser phase.
        */
        GameMap.prototype.create = function () {
            this.tilemap = this.game.add.tilemap(this.mapName);
        };

        /**
        *  Loads JSON file from the URL built from the map name.
        */
        GameMap.prototype.loadJsonData = function () {
            var _this = this;
            this.loaded = false;
            var filename = "assets/maps/" + this.mapName + ".json";

            var request = new XMLHttpRequest();
            request.onload = function (ev) {
                var tiledMap = JSON.parse(request.responseText);
                var tileSets = tiledMap.tilesets;

                for (var i = 0, l = tileSets.length; i < l; ++i) {
                    var tileset = tileSets[i];
                    var name = tileset.name;
                    _this.tilesetNames.push(name);
                }

                _this.loaded = true;
            };
            request.open("get", filename, true);
            request.send();
        };
        return GameMap;
    })();
    KGAD.GameMap = GameMap;
})(KGAD || (KGAD = {}));
//# sourceMappingURL=GameMap.js.map
