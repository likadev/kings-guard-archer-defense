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

        constructor(game: Phaser.Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);

            this.anchor.setTo(0.5);
            this.action = Actions.Standing;
            this.direction = Directions.Down;
            this.added = false;
            this.canOccupy = true;
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
            return 2;
        }

        public addToWorld(): void {
            if (!this.added) {
                this.default_animation = AnimationHelper.getCurrentAnimation(this);
                var animation = this.animations.getAnimation(this.default_animation);
                
                if (animation != null) {
                    this.animations.play(this.default_animation);
                }

                this.game.world.add(this);
                this.added = true;
            }

            this.lastPosition = this.position;
            this.tilePosition = new Phaser.Point(Math.floor(this.x / GameMap.TILE_WIDTH), Math.floor(this.y / GameMap.TILE_HEIGHT));
            this.lastTilePosition = this.tilePosition;

            this.map.occupy(this.tilePosition.x, this.tilePosition.y, this);
        }

        public face(sprite: AnimatedSprite) {
            var angle = this.game.physics.arcade.angleBetween(this.position, sprite.position);
            this.direction = MovementHelper.getDirectionFromAngle(angle);
        }

        public updateAnimation(onComplete?: () => any): void {
            var animationName: string = AnimationHelper.getCurrentAnimation(this);
            if (animationName != null) {
                if (animationName === this.animations.currentAnim.name) {
                    return;
                }

                var player = null;
                var animation = this.animations.getAnimation(animationName);
                if (animation != null) {
                    player = this.animations.play(animationName);
                }
                else {
                    this.action = Actions.Standing;
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

            return this;
        }

        preUpdate(): void {
            super.preUpdate();
        }

        update(): void {
            super.update();

            var map = Game.CurrentMap;
            this.tilePosition = <Phaser.Point>map.fromPixels(this.position);

            if (this.canOccupyTiles) {
                var map = Game.CurrentMap;
                if (!this.tilePosition.equals(this.lastTilePosition)) {
                    if (!map.occupy(this.tilePosition.x, this.tilePosition.y, this)) {
                        this.position = this.lastPosition;
                    }
                    else {
                        this.lastPosition = this.position;
                        this.lastTilePosition = this.tilePosition;
                    }
                }
            }
        }

        render(): void {
            
        }
    }
}