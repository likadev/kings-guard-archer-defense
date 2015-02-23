// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../input/AnimationHelper.ts" />

module KGAD {
    export class AnimatedSprite extends Phaser.Sprite {
        public default_animation: string = 'face_down';
        public action: Actions;
        public direction: Directions;
        public tilePosition: Phaser.Point;
        private added: boolean;
        protected lastPosition: Phaser.Point;
        protected lastTilePosition: Phaser.Point;
        protected canOccupy: boolean;
        protected isBlocked: boolean;
        protected movementTween: Phaser.Tween;
        protected pathFindingMover: PathMovementMachine;
        protected movementSpeed: number;

        public blocked: Phaser.Signal;
        public movementTweenCompleted: Phaser.Signal;

        constructor(game: Phaser.Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            this.texture.baseTexture.mipmap = true;

            this.anchor.setTo(0.5);
            this.action = Actions.Standing;
            this.direction = Directions.Down;
            this.added = false;
            this.canOccupy = true;
            this.isBlocked = false;

            this.blocked = new Phaser.Signal();
            this.movementTweenCompleted = new Phaser.Signal();

            this.pathFindingMover = new PathMovementMachine(this);
            this.movementSpeed = 100;
            this.fixedToCamera = false;
        }

        init(...args: any[]): void {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);

            this.body.bounce.setTo(0.0);
            this.body.collideWorldBounds = true;
            this.body.immovable = true;
        }

        public get canOccupyTiles(): boolean {
            return this.canOccupy;
        }

        public set canOccupyTiles(val: boolean) {
            this.canOccupy = val;
        }

        public get map(): GameMap {
            return Game.CurrentMap;
        }

        public preload(): void {

        }

        public get weight(): number {
            if (this.action === Actions.Dying || this.action === Actions.Dead) {
                return 1;
            }

            return 2;
        }

        public get alliance(): Alliance {
            return Alliance.Ally;
        }

        public addToWorld(): void {
            if (!this.added) {
                this.default_animation = AnimationHelper.getCurrentAnimation(this);
                var animation = this.animations.getAnimation(this.default_animation);
                
                if (animation != null) {
                    this.animations.play(this.default_animation);
                }

                this.added = true;
            }

            this.lastPosition = this.position;
            this.tilePosition = new Phaser.Point(Math.floor(this.x / GameMap.TILE_WIDTH), Math.floor(this.y / GameMap.TILE_HEIGHT));
            this.lastTilePosition = new Phaser.Point(this.tilePosition.x, this.tilePosition.y);

            var addCallback: () => any = null;
            addCallback = () => {
                if (!OccupiedGrid.canOccupyInPixels(this, this.position)) {
                    console.log('spawn point is occupied; waiting for it to free up');
                    this.game.time.events.add(100,() => { addCallback(); }, this);
                }
                else {
                    OccupiedGrid.add(this);

                    this.game.world.add(this);
                }
            };

            addCallback();
        }

        public face(sprite: AnimatedSprite) {
            var angle = this.game.physics.arcade.angleBetween(this.position, sprite.position);
            this.direction = MovementHelper.getDirectionFromAngle(angle);
        }

        public updateAnimation(onComplete?: () => any): void {
            var animationName: string = AnimationHelper.getCurrentAnimation(this);
            var currentAnimation = this.animations.currentAnim;
            if (animationName != null) {
                if (currentAnimation != null && animationName === currentAnimation.name) {
                    return;
                }

                var player = null;
                var animation = this.animations.getAnimation(animationName);
                if (animation != null) {
                    player = this.animations.play(animationName);
                }
                else {
                    this.action = Actions.Moving;
                    animationName = AnimationHelper.getCurrentAnimation(this);
                    animation = this.animations.getAnimation(animationName);
                    if (animation != null) {
                        player = this.animations.play(animationName);
                    }
                }

                if (onComplete) {
                    player.onComplete.addOnce(onComplete);
                }
            }
        }

        public inflictDamage(amount: number, source: AnimatedSprite): AnimatedSprite {
            super.damage(amount);

            if (this.health <= 0) {
                OccupiedGrid.remove(this);
            }

            return this;
        }

        public kill(): Phaser.Sprite {
            this.pathFindingMover.currentPath = null;
            this.pathFindingMover = null;
            this.stopMovementTween();

            return super.kill();
        }

        /**
         *  Stop the current movement tween if it's running.
         */
        protected stopMovementTween(complete: boolean = false) {
            if (this.movementTween != null && this.movementTween.isRunning) {
                this.movementTween.stop(complete);
            }

            this.movementTween = null;
        }

        /**
         *  Gets whether or not a movement tween is in progress.
         */
        public isMoveTweening(): boolean {
            return this.movementTween != null && this.movementTween.isRunning;
        }

        /**
         *  Move to the given (x, y) coordinate.
         */
        public moveTweenTo(position: { x: number; y: number; }): boolean {
            var distance = Phaser.Point.distance(this.position, position);
            if (distance <= 0.0001) {
                setTimeout(() => {
                    this.movementTweenCompleted.dispatch();
                }, 0);
                return false;
            }

            this.stopMovementTween();

            if (!OccupiedGrid.canOccupyInPixels(this, position.x, position.y)) {
                return false;
            }

            var timeToMove = (distance / this.movementSpeed) * 1000.0;

            this.movementTween = this.game.add.tween(this)
                .to(position, timeToMove, Phaser.Easing.Linear.None, false, 0);
            this.movementTween.onComplete.addOnce(() => { this.movementTweenCompleted.dispatch(); });
            this.movementTween.start();

            return true;
        }

        preUpdate(): void {
            var map = Game.CurrentMap;

            if (!this.alive || !this.exists || this.health <= 0) {
                super.preUpdate();
                return;
            }

            if (this.canOccupyTiles) {
                var occupants: AnimatedSprite[] = [];
                if (!OccupiedGrid.canOccupyInPixels(this, this.position, null, occupants)) {
                    this.position = this.lastPosition;
                    if (this.body) {
                        this.body.velocity.setTo(0);
                    }

                    this.stopMovementTween();
                    this.isBlocked = true;

                    this.blocked.dispatch(occupants);
                }
                else {
                    this.isBlocked = false;
                }

                OccupiedGrid.update(this);
            }

            this.tilePosition = <Phaser.Point>map.fromPixels(this.position);
            this.lastPosition = new Phaser.Point(this.position.x, this.position.y);
            this.lastTilePosition = new Phaser.Point(this.tilePosition.x, this.tilePosition.y);

            super.preUpdate();
        }

        update(): void {
            super.update();
        }

        render(): void {
            
        }
    }
}