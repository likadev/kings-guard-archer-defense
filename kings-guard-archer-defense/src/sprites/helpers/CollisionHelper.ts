// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class CollisionHelper {
        public static raycast(line: Phaser.Line|Phaser.Line[], stepRate: number = 4): Phaser.Tile[] {
            var map = Game.CurrentMap;
            var enemies = Game.Enemies;
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
            var enemies = Game.Enemies;
            var coords: Phaser.Point[];
            var spriteHits: AnimatedSprite[];
            var game = Game.Instance;
            var _line: Phaser.Line;
            var grid = OccupiedGrid;
            var undef;

            if (line instanceof Array) {
                for (var i = 0, l = line.length; i < l; ++i) {
                    _line: Phaser.Line = line[i];
                    coords = _line.coordinatesOnLine(stepRate, undef);
                    
                    spriteHits = [];

                    for (var k = 0, n = coords.length; k < n; ++k) {
                        var coord = coords[k];
                        var occupant = grid.getOccupantOfInPixels(coord);
                        if (occupant != null) {
                            if (occupant === requestor) {
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
                coords = _line.coordinatesOnLine(stepRate, undef);
                spriteHits = [];

                for (var k = 0, n = coords.length; k < n; ++k) {
                    var coord = coords[k];
                    var tileCoord = <Phaser.Point>map.fromPixels(new Phaser.Point(coord[0], coord[1]));
                    var occupant = grid.getOccupantOfInPixels(coord);
                    if (occupant != null) {
                        if (occupant === requestor) {
                            continue;
                        }
                        else {
                            spriteHits.push(occupant);
                        }
                        break;
                    }
                }
            }

            return spriteHits;
        }
    }
}