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
        private centering: boolean;
        private isComplete: boolean;
        private tweening: boolean;

        public blocked: Phaser.Signal;

        public completed: Phaser.Signal;

        constructor(public game: Phaser.Game, public sprite: AnimatedSprite) {
            this.currentDestination = null;
            this.map = Game.CurrentMap;
            this.blockedTime = 0;
            this.isComplete = true;
            this.tweening = false;
            this.blocked = new Phaser.Signal();
            this.completed = new Phaser.Signal();
        }

        /**
         *  Gets whether or not the movement is running.
         */
        public get isRunning(): boolean {
            return !this.isComplete;
        }

        /**
         *  Stop the movement tween.
         */
        public stop(complete: boolean = true) {
            this.currentDestination = null;
            this.timeToMove = 0;
            this.blockedTime = 0;
            this.isComplete = true;

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
            this.isComplete = this.timeToMove === 0;
        }

        /**
         *  Move towards the goal.
         */
        private step(): void {
            if (this.currentDestination == null || this.isComplete || this.tweening) {
                return;
            }

            var dt = this.game.time.physicsElapsedMS;
            this.timeToMove -= dt;
            var completeMovement = false;

            if (this.timeToMove <= 0) {
                completeMovement = true;
            }

            var xMovement = Math.cos(this.angle);
            var yMovement = Math.sin(this.angle);

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
                if (Math.abs(oldX - x) > 1 || Math.abs(oldY - y) > 1) {
                    this.sprite.position.set(oldX, oldY);
                    OccupiedGrid.add(this.sprite);

                    if (this.centering) {
                        var distance = Phaser.Point.distance(this.sprite.position, this.currentDestination);
                        var speed = (this.distance / (this.sprite.movementSpeed * 4)) * 1000.0;
                        var tween = this.game.add.tween(this.sprite).to({ x: this.currentDestination.x, y: this.currentDestination.y },
                            this.sprite.movementSpeed * 2, Phaser.Easing.Linear.None, false);
                        this.tweening = true;
                        tween.onComplete.addOnce(() => {
                            this.tweening = false;
                            OccupiedGrid.add(this.sprite);
                            this.onMovementCompleted();
                        });
                        tween.start();
                    }
                    else {
                        this.centerOnTile();
                    }
                }
                else {
                    this.onMovementCompleted();
                }
            }
        }

        /**
         *  Move to the center of a tile.
         */
        private centerOnTile() {
            this.generateData();
            this.centering = true;
            console.log('centering... distance=' + this.distance + ', time=' + this.timeToMove);
        }

        /**
         *  Called internally.
         */
        private onMovementCompleted() {
            this.isComplete = true;
            this.centering = false;
            this.currentDestination = null;
            this.completed.dispatch();
        }

        /**
         *  Figure out what to do when we're blocked from moving to the next tile.
         */
        private handleBlocked(byWho: AnimatedSprite[]) {
            if (this.blockedTime === 0) {
                this.blockedTime = this.game.time.now;
            }
            else {
                var beingBlockedByEnemy = false;
                for (var i = 0, l = byWho.length; i < l; ++i) {
                    if (byWho[i].alliance !== this.sprite.alliance) {
                        beingBlockedByEnemy = true;
                        break;
                    }
                }

                if (beingBlockedByEnemy || this.game.time.now - this.blockedTime >= MoveTween.BLOCKED_THRESHOLD) {
                    console.log(this.sprite.key + ' is blocked by ' + (byWho[0] || { key: 'a wall' }).key + ', stopping tween');
                    this.stop(false);
                    this.blocked.dispatch(byWho);
                }
            }
        }
    }
}