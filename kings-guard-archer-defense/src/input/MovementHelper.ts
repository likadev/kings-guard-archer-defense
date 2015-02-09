// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class MovementHelper {
        public static move(sprite: AnimatedSprite, direction: Directions, speed: number = 200): boolean {
            var map = Game.CurrentMap;
            var game = sprite.game;

            var dir: number = parseInt(<any>direction, 10);
            var originPixels: Phaser.Point = sprite.position;
            var origin: Phaser.Point = <Phaser.Point>map.fromPixels(originPixels);
            var dest: Phaser.Point = null;

            switch (dir) {
                case Directions.Up:
                    dest = new Phaser.Point(origin.x, origin.y - 1);
                    break;

                case Directions.Left:
                    dest = new Phaser.Point(origin.x - 1, origin.y);
                    break;

                case Directions.Down:
                    dest = new Phaser.Point(origin.x, origin.y + 1);
                    break;

                case Directions.Right:
                    dest = new Phaser.Point(origin.x + 1, origin.y);
                    break;

                default:
                    throw new Error("Invalid direction: " + direction);
            }

            dest = <Phaser.Point>map.toPixels(dest);

            var startTime = game.time.now;
            var maxTime = (Phaser.Point.distance(originPixels, dest) / speed) * 1000;

            game.physics.arcade.moveToXY(sprite, dest.x, dest.y, speed, maxTime);

            return true;
        }

        public static getPointFromDirection(dir: Directions): Phaser.Point {
            var direction: number = parseInt(<any>dir, 10);

            switch (direction) {
                case Directions.Up:
                    return new Phaser.Point(0, -1);

                case Directions.Left:
                    return new Phaser.Point(-1, 0);

                case Directions.Down:
                    return new Phaser.Point(0, 1);

                case Directions.Right:
                    return new Phaser.Point(1, 0);
            }

            return new Phaser.Point();
        }
    }
}