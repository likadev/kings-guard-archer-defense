// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../input/AnimationHelper.ts" />

module KGAD {
    export class AnimatedSprite extends Phaser.Sprite {
        public default_animation: string = 'face_down';
        public action: Actions;
        public direction: Directions;
        public node: Phaser.Point;
        public movementSpeed: number;
        public renderPriority: number;
        protected lastPosition: Phaser.Point;
        protected lastNode: Phaser.Point;
        protected canOccupy: boolean;
        protected isBlocked: boolean;
        protected movementTween: MoveTween;
        protected damageTween: Phaser.Tween;
        protected pathFindingMover: PathMovementMachine;
        protected sequentialBlocks: number;
        protected _moving: boolean;
        protected _pathing: boolean;
        private added: boolean;
        private _hasHealthBar: boolean;
        private healthBar: HealthBar;

        public blocked: Phaser.Signal;
        public movementTweenCompleted: Phaser.Signal;
        public pathfindingComplete: Phaser.Signal;

        constructor(game: Phaser.Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.autoCull = false;
            this.checkWorldBounds = false;

            this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            //this.texture.baseTexture.mipmap = true;

            this.anchor.setTo(0.5);
            this.action = Actions.Standing;
            this.direction = Directions.Down;
            this.added = false;
            this.canOccupy = true;
            this.isBlocked = false;
            this.sequentialBlocks = 0;
            this._pathing = false;

            this.blocked = new Phaser.Signal();
            this.movementTweenCompleted = new Phaser.Signal();
            this.pathfindingComplete = new Phaser.Signal();

            this.pathFindingMover = new PathMovementMachine(this);
            this.movementSpeed = 100;
            this.fixedToCamera = false;
            this.renderPriority = 0;
            this.visible = false;
        }

        init(...args: any[]): void {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);

            this.body.bounce.setTo(0.0);
            this.body.collideWorldBounds = true;
            this.body.immovable = true;

            this.healthBar = new HealthBar(this.game, this);
            this.healthBar.init(this.health);
            this.healthBar.visible = false;
        }

        public get hasHealthBar(): boolean {
            return this._hasHealthBar;
        }

        public set hasHealthBar(_hasHealthBar: boolean) {
            var addHealthBar = !this._hasHealthBar && this._hasHealthBar !== _hasHealthBar;
            var removeHealthBar = this._hasHealthBar && this._hasHealthBar !== _hasHealthBar;
            this._hasHealthBar = _hasHealthBar;

            if (addHealthBar) {
                this.healthBar.visible = true;
            }
            else if (removeHealthBar) {
                this.healthBar.visible = false;
            }
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

        public get weight(): number {
            if (this.action === Actions.Dying || this.action === Actions.Dead) {
                return 1;
            }

            else if (this.action === Actions.Firing) {
                return 0;
            }

            return 2;
        }

        public get alliance(): Alliance {
            return Alliance.Ally;
        }

        public preload(): void {}

        public addToWorld(): void {
            if (!this.added) {
                this.default_animation = AnimationHelper.getCurrentAnimation(this);
                var animation = this.animations.getAnimation(this.default_animation);
                
                if (animation != null) {
                    this.animations.play(this.default_animation);
                }

                this.added = true;
                this.visible = true;
            }

            this.lastPosition = this.position.clone();
            this.lastNode = this.node;
            this.node = new Phaser.Point(Math.floor(this.x / OccupiedGrid.NODE_SIZE), Math.floor(this.y / OccupiedGrid.NODE_SIZE));

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

        /**
         *  Face towards another sprite.
         */
        public face(sprite: AnimatedSprite|Directions) {
            if (typeof sprite === 'number') {
                this.direction = <Directions>sprite;
            }
            else {
                var angle = this.game.physics.arcade.angleBetween(this.position, (<AnimatedSprite>sprite).position);
                this.direction = MovementHelper.getDirectionFromAngle(angle);
            }
            this.updateAnimation();
        }

        /**
         *  Updates the animation for the sprite.
         */
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

                if (onComplete && player != null) {
                    player.onComplete.addOnce(onComplete);
                }
            }
        }

        /**
         *  Inflict damage to the sprite. This will show a damage tween and update the animation.
         */
        public inflictDamage(amount: number, source: AnimatedSprite): AnimatedSprite {
            super.damage(amount);

            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }

            this.damageTween = AnimationHelper.createDamageTween(this);
            this.damageTween.start();

            if (this.health <= 0) {
                OccupiedGrid.remove(this);

                this.healthBar.destroy();

                this.showDeathAnimation();
            }

            return this;
        }

        /**
         *  Shows the sprite's death animation, if it has one.
         */
        protected showDeathAnimation(onDeathAnimationComplete?: () => any) {
            this.stopMovementTween();

            var onAnimationComplete = () => {
                this.action = Actions.Dead;
                this.updateAnimation();

                var targetAlpha = 0;

                this.game.add.tween(this).to({ alpha: targetAlpha }, 500).start().onComplete.addOnce(() => {
                    if (onDeathAnimationComplete) {
                        onDeathAnimationComplete();
                    }

                    this.kill();
                });
            };

            this.action = Actions.Dying;
            this.direction = Directions.Down;
            var animationName = AnimationHelper.getCurrentAnimation(this);
            if (this.animations.getAnimation(animationName) == null) {
                this.action = Actions.Dead;
            }

            this.updateAnimation(onAnimationComplete);
        }

        /**
         *  Kills the sprite, removing it from the game.
         */
        public kill(): Phaser.Sprite {
            if (this.pathFindingMover) {
                this.pathFindingMover.currentPath = null;
            }
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
                return false;
            }

            this.stopMovementTween();

            if (!OccupiedGrid.canOccupyInPixels(this, position.x, position.y)) {
                return false;
            }

            var savedPosition = new Phaser.Point(this.x, this.y);
            this.position = new Phaser.Point(position.x, position.y);
            this.position = savedPosition;

            var timeToMove = (distance / this.movementSpeed) * 1000.0;

            this.movementTween = new MoveTween(this.game, this);
            this.movementTween.moveTo(position.x, position.y);
            this.movementTween.completed.addOnce(() => {
                this.movementTweenCompleted.dispatch();
            });
            this.movementTween.blocked.addOnce((collisions: AnimatedSprite[]) => {
                this.blocked.dispatch(collisions);
            });

            return true;
        }

        /**
         *  Find a path to and begin moving to the target destination.
         */
        public pathfindTo(x: number|Phaser.Point, y?: number, onComplete?: () => any): boolean {
            this.stopMovementTween(false);

            var current: Phaser.Point = this.map.fromPixels(this.x, this.y);
            var target: Phaser.Point = this.map.fromPixels(x, y);

            var points: Phaser.Point[] = this.map.findPath(current, target);
            if (!points) {
                return false;
            }

            var gridPath: Path<Phaser.Rectangle> = OccupiedGrid.convertToGridPath(new Path(points));
            this.pathFindingMover.currentPath = gridPath;

            if (onComplete) {
                this.pathfindingComplete.addOnce(onComplete);
            }

            this._pathing = true;

            return true;
        }

        /**
         *  Update the internal understanding of our node position.
         */
        protected updateNodePosition() {
            this.lastNode = this.node;
            this.node = new Phaser.Point(Math.floor(this.x / OccupiedGrid.NODE_SIZE), Math.floor(this.y / OccupiedGrid.NODE_SIZE));
        }

        /**
         *  Un-sets the current path, allowing a new one to be created.
         */
        protected unsetCurrentPath(): any {
            this.pathFindingMover.currentPath = null;

            return null;
        }

        /**
         *  Moves to the next destination in the pathfinding node.
         */
        protected moveToNextDestination(): boolean {
            if (this.isMoveTweening()) {
                return false;
            }

            var path = this.pathFindingMover.currentPath;
            if (path == null) {
                return false;
            }

            var rect = path.next();
            if (rect == null) {
                if (this._pathing) {
                    this.pathfindingComplete.dispatch();
                    this._pathing = false;
                }
                this.unsetCurrentPath();
                return false;
            }

            var center = new Phaser.Point(rect.centerX, rect.centerY);
            var angle = this.game.physics.arcade.angleBetween(this.position, center);
            this.direction = MovementHelper.getDirectionFromAngle(angle);
            this.action = Actions.Moving;
            this.updateAnimation();

            this.moveTweenTo(center);

            return true;
        }

        /**
         *  Called before the 'update' step.
         */
        public preUpdate(): void {
            //(<any>this)._cache[4] = 0;
            var map = Game.CurrentMap;

            if (!this.alive || !this.exists || this.health <= 0) {
                super.preUpdate();
                return;
            }

            if (this.pathFindingMover.currentPath && this.pathFindingMover.currentPath.length > 0 && !this.isMoveTweening()) {
                this.moveToNextDestination();
            }

            if (this.movementTween != null && this.movementTween.isRunning) {
                this.movementTween.update();
            }
            else {
                if (this.canOccupyTiles && this instanceof Hero) {
                    var occupants: AnimatedSprite[] = [];
                    if (!OccupiedGrid.add(this, occupants)) {
                        ++this.sequentialBlocks;
                        this.position = this.lastPosition.clone();
                        if (this.body) {
                            this.body.velocity.setTo(0);
                        }

                        this.stopMovementTween();
                        this.isBlocked = true;

                        this.blocked.dispatch(occupants);
                    }
                    else {
                        this.sequentialBlocks = 0;
                        this.isBlocked = false;
                    }

                    occupants = [];
                    if (this.sequentialBlocks > 15 || !OccupiedGrid.canOccupyInPixels(this, this.position, null, occupants)) {
                        // If we still can't occupy it, resolve collision.
                        //this.resolveCollision(occupants);
                    }
                }
            }

            this.updateNodePosition();
            this.lastPosition = new Phaser.Point(this.position.x, this.position.y);

            super.preUpdate();
        }

        /**
         *  
         */
        update(): void {
            super.update();

            this.healthBar.update();
        }

        postUpdate(): void {
            (<any>this)._cache[7] = 0;

            super.postUpdate();
        }

        render(): void {
            
        }
    }
}