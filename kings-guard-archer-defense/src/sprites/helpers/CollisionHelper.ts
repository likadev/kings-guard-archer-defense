// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class CollisionHelper {
        public static raycast(line: Phaser.Line|Phaser.Line[], stepRate: number = 4): Phaser.Tile[] {
            var map = Game.CurrentMap;
            var info = GameInfo.CurrentGame;
            var enemies = info.enemies.enemies;
            var hits: Phaser.Tile[] = [];

            if (line instanceof Array) {
                for (var i = 0, l = line.length; i < l; ++i) {
                    var _line = line[i];
                    var tileHits = map.collisionLayer.getRayCastTiles(_line, stepRate, true, false);

                    for (var j = 0, m = tileHits.length; j < m; ++j) {
                        var hit = tileHits[j];
                        if (hits.indexOf(hit) < 0) {
                            hits.push(hit);
                        }
                    }
                }
            }
            else {
                hits = map.collisionLayer.getRayCastTiles(<Phaser.Line>line, stepRate, true, false);
            }

            return hits;
        }

        /**
         *  Performs a raycast for sprites.
         */
        public static raycastForSprites(line: Phaser.Line|Phaser.Line[], stepRate: number = 4, requestor?: AnimatedSprite): AnimatedSprite[] {
            var map = Game.CurrentMap;
            var info = GameInfo.CurrentGame;
            var enemies = info.enemies.enemies;
            var coords: Phaser.Point[];
            var spriteHits: AnimatedSprite[];
            var _line: Phaser.Line;

            if (line instanceof Array) {
                for (var i = 0, l = line.length; i < l; ++i) {
                    _line: Phaser.Line = line[i];
                    coords = _line.coordinatesOnLine(stepRate, coords);
                    spriteHits = [];

                    for (var k = 0, n = coords.length; k < n; ++k) {
                        var coord = coords[k];
                        var tileCoord = <Phaser.Point>map.fromPixels(coord);
                        var occupant = map.getOccupantOf(tileCoord.x, tileCoord.y);
                        if (occupant != null) {
                            if (requestor != null && occupant == requestor) {
                                continue;
                            }
                            else {
                                spriteHits.push(occupant);
                            }
                        }
                    }
                }
            }
            else {
                _line = <Phaser.Line>line;
                var undef;
                coords = _line.coordinatesOnLine(stepRate, undef);
                spriteHits = [];

                for (var k = 0, n = coords.length; k < n; ++k) {
                    var coord = coords[k];
                    var tileCoord = <Phaser.Point>map.fromPixels(new Phaser.Point(coord[0], coord[1]));
                    var occupant = map.getOccupantOf(tileCoord.x, tileCoord.y);
                    if (occupant != null) {
                        spriteHits.push(occupant);
                        break;
                    }
                }
            }

            return spriteHits;
        }
    }
}