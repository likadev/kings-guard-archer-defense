// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class CollisionHelper {
        public static raycast(line: Phaser.Line|Phaser.Line[], stepRate: number = 4): Phaser.Tile[] {
            var map = Game.CurrentMap;
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
    }
}