// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class MoveTween {
        private static BLOCKED_THRESHOLD = 250;

        public currentDestination: Phaser.Point;
        public map: GameMap;
        private angle: number;
        private direction: Directions;
        private timeToMove: number;
        private distance: number;
        private blockedTime: number;

        public blocked: Phaser.Signal;

        public completed: Phaser.Signal;

        constructor(public game: Phaser.Game, public sprite: AnimatedSprite) {
            this.currentDestination = null;
            this.map = Game.CurrentMap;
            this.blockedTime = 0;
            this.blocked = new Phaser.Signal();
            this.completed = new Phaser.Signal();
        }

        /**
         *  Gets whether or not the movement is running.
         */
        public get isRunning(): boolean {
            return this.timeToMove > 0;
        }

        /**
         *  Stop the movement tween.
         */
        public stop(complete: boolean = true) {
            this.currentDestination = null;
            this.timeToMove = 0;
            this.blockedTime = 0;

            if (complete) {
                this.completed.dispatch();
            }
        }

        /**
         *  Move to the given (x, y) coordinate (in pixels).
         */
        public moveTo(x: number|Phaser.Point, y?: number): boolean {
            var dest: Phaser.Point;
            if (typeof x === 'number') {
                dest = new Phaser.Point(x, y);
            }
            else {
                dest = x.clone();
            }

            this.currentDestination = dest;
            this.generateData();

            return true;
        }

        /**
         *  Updates the internal tween.
         */
        public update(): void {
            this.step();
        }

        /**
         *  Generates the data required to step.
         */
        private generateData(): void {
            this.angle = this.game.physics.arcade.angleBetween(this.sprite.position, this.currentDestination);
            this.direction = MovementHelper.getDirectionFromAngle(this.angle);
            this.distance = Phaser.Point.distance(this.sprite.position, this.currentDestination);
            this.timeToMove = (this.distance / this.sprite.movementSpeed) * 1000.0;
        }

        /**
         *  Move towards the goal.
         */
        private step(): void {
            if (this.currentDestination == null) {
                return;
            }

            var dt = this.game.time.physicsElapsedMS;
            this.timeToMove -= dt;
            var completeMovement = false;

            if (this.timeToMove <= 0) {
                completeMovement = true;
            }

            var xMovement = this.direction === Directions.Left ? -1 : this.direction === Directions.Right ? 1 : 0;
            var yMovement = this.direction === Directions.Up ? -1 : this.direction === Directions.Down ? 1 : 0;

            var oldX = this.sprite.x;
            var oldY = this.sprite.y;
            var x: number, y: number;
            if (completeMovement) {
                x = this.currentDestination.x;
                y = this.currentDestination.y;
            }
            else {
                x = oldX + xMovement * this.game.time.physicsElapsed * this.sprite.movementSpeed;
                y = oldY + yMovement * this.game.time.physicsElapsed * this.sprite.movementSpeed;
            }

            var occupants: AnimatedSprite[] = [];
            this.sprite.position.set(x, y);
            if (!OccupiedGrid.add(this.sprite, occupants)) {
                this.sprite.position.set(oldX, oldY);
                completeMovement = false;
                this.timeToMove += dt;
                this.handleBlocked(occupants);
            }

            if (completeMovement) {
                this.currentDestination = null;
                this.completed.dispatch();
            }
        }

        /**
         *  Figure out what to do when we're blocked from moving to the next tile.
         */
        private handleBlocked(byWho: AnimatedSprite[]) {
            if (this.blockedTime === 0) {
                this.blockedTime = this.game.time.now;
            }
            else {
                if (this.game.time.now - this.blockedTime >= MoveTween.BLOCKED_THRESHOLD) {
                    this.stop(false);
                    this.blocked.dispatch(byWho);
                }
            }
        }
    }
}