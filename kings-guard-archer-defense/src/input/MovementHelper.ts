// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class MovementHelper {
        static angleIncrements = [
            { first: 0, second: Math.PI / 4, direction: Directions.Left },
            { first: Math.PI / 4, second: (3 * Math.PI) / 4, direction: Directions.Up },
            { first: (3 * Math.PI) / 4, second: (5 * Math.PI) / 4, direction: Directions.Right },
            { first: (5 * Math.PI) / 4, second: (7 * Math.PI) / 4, direction: Directions.Down },
            { first: (7 * Math.PI) / 4, second: (2 * Math.PI) + 1, direction: Directions.Left },
        ];


        /**
         *  Moves a sprite in the given direction.
         */
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

            var angle: number = MovementHelper.getAngleFromDirection(direction);
            game.physics.arcade.velocityFromRotation(angle, speed, sprite.body.velocity);

            //game.physics.arcade.moveToXY(sprite, dest.x, dest.y, speed);

            return true;
        }

        /**
         *  Gets a point that is one pixel away in the given direction.
         */
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

        public static getRotationFromDirections(dir1: Directions, dir2: Directions) {
            var angle1 = MovementHelper.getAngleFromDirection(dir1);
            var angle2 = MovementHelper.getAngleFromDirection(dir2);
            var a = angle2 - angle1;
            a = ((a + Math.PI) % Math.PI * 2) - Math.PI;
            return a;
        }

        /**
         *  Clamps an angle to a number between 0 and 2PI in radians.
         */
        private static clampAngle(angle: number): number {
            var twopi = Math.PI * 2;
            while (angle < 0) {
                angle += twopi;
            }

            while (angle > twopi) {
                angle -= twopi;
            }

            return angle;
        }

        private static convertAngle(angle: number): number {
            return MovementHelper.clampAngle(angle + Math.PI);
        }

        /**
         *  Gets an angle in radians from a direction.
         */
        public static getAngleFromDirection(dir: Directions): number {
            switch (parseInt(<any>dir, 10)) {
                case Directions.Up:
                    return -Math.PI / 2;

                case Directions.Left:
                    return Math.PI;

                case Directions.Right:
                    return 0;

                case Directions.Down:
                    return -Math.PI * 3 / 2;
            }

            return 0;
        }

        /**
         *  Gets the best approximate direction based on the given angle.
         */
        public static getDirectionFromAngle(angle: number): Directions {
            var game = Game.Instance;

            var piOver4 = Math.PI / 4;
            var threePiOver4 = piOver4 * 3;

            if (angle <= piOver4 && angle > -piOver4) {
                return Directions.Right;
            }
            else if (angle <= threePiOver4 && angle > piOver4) {
                return Directions.Down;
            }
            else if (angle >= threePiOver4 || angle < -threePiOver4) {
                return Directions.Left;
            }
            else {
                return Directions.Up;
            }

            var origAngle = angle;
            angle = MovementHelper.convertAngle(angle);

            for (var i = 0, l = this.angleIncrements.length; i < l; ++i) {
                var increment = this.angleIncrements[i];
                if (angle >= increment.first && angle < increment.second) {
                    return increment.direction;
                }
            }

            console.error('no direction found for angle: ' + angle);
            return Directions.Right;
        }

        public static getNameOfDirection(direction: Directions): string {
            switch (parseInt(<any>direction, 10)) {
                case Directions.Up:
                    return "up";

                case Directions.Down:
                    return "down";

                case Directions.Left:
                    return "left";

                case Directions.Right:
                    return "right";
            }

            return "null";
        }
    }
}