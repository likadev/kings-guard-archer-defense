// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Mercenary extends AnimatedSprite {
        private threatTable: ThreatTable;
        protected startingPoint: Phaser.Point;
        protected startingDirection: Directions;
        protected damageTween: Phaser.Tween;
        protected currentTarget: Enemy;
        protected engageRange: number;
        protected weapon: Weapon;

        constructor(game: Phaser.Game, x: number, y: number, key?: string, frame?: any) {
            super(game, x, y, key, frame);

            this.movementSpeed = 50;
            this.health = 3;
            this.engageRange = 128;
        }

        init(...args: any[]) {
            super.init(args);

            this.hasHealthBar = true;

            this.weapon = new Weapon(this.game, 'short_sword', {
                cooldown: 1500,
                range: 36,
                backSwing: 500,
                power: 1,
            });

            this.threatTable = new ThreatTable(this);
            this.threatTable.highestThreatChanged.add((sprite) => { this.onHighestThreatTargetChanged(sprite); });
            AnimationLoader.addAnimationToSprite(this, this.key);

            this.blocked.add(this.onBlocked, this);
        }

        addToWorld(): void {
            super.addToWorld();

            this.startingPoint = this.map.toPixels(this.map.fromPixels(this.x, this.y)).add(16, 16);
            this.startingDirection = this.direction;
        }

        private onBlocked(occupants: AnimatedSprite[]) {
            this.unsetCurrentPath();

            if (this.currentTarget == null) {
                this.goHome();
            }
        }

        public checkThreatAgainst(enemy: Enemy): void {
            var distance = Phaser.Point.distance(this.startingPoint, enemy);
            if (distance > this.engageRange) {
                return;
            }

            if (distance <= this.engageRange) {
                var threat = (Math.max(1,(this.engageRange - distance)) / this.engageRange) * 0.075;
                this.threatTable.addThreat(enemy, threat);
            }
            else {
                this.threatTable.addThreat(enemy, -0.1);
            }
        }

        public get weight(): number {
            if (this.action === Actions.Firing) {
                return 0;
            }
            else if (this.action === Actions.Standing) {
                return 5;
            }
            else if (this.action === Actions.Dead || this.action === Actions.Dying) {
                return 1;
            }

            return 2;
        }

        public get alliance(): Alliance {
            return Alliance.Ally;
        }


        public inflictDamage(amount: number, source: AnimatedSprite): AnimatedSprite {
            var willDie = false;
            if (this.health - amount <= 0) {
                willDie = true;
            }

            if (!willDie) {
                this.threatTable.addThreat(source, amount * 2);
                super.damage(amount);
            }
            else {
                this.health = 0;
                delete this.body;
            }

            if (this.health <= 0) {
                if (!OccupiedGrid.remove(this)) {
                    console.error("Mercenary was not removed!");
                }

                if (this.movementTween != null && this.movementTween.isRunning) {
                    this.movementTween.stop(false);
                }

                var onAnimationComplete = () => {
                    this.action = Actions.Dead;
                    this.updateAnimation();
                    this.game.add.tween(this).to({ alpha: 0 }, 500).start().onComplete.addOnce(() => {
                        this.kill();
                    });
                };

                this.action = Actions.Dying;
                this.direction = Directions.Down;
                this.updateAnimation(onAnimationComplete);
            }

            if (this.damageTween != null && this.damageTween.isRunning) {
                this.damageTween.stop(false);
                this.tint = 0xFFFFFF;
            }

            this.damageTween = AnimationHelper.createDamageTween(this);
            this.damageTween.start();

            return this;
        }

        update(): void {
            super.update();
            var dead = !this.alive || !this.exists || this.health <= 0;

            if (dead || this.weapon.isBackSwinging()) {
                return;
            }

            this.threatTable.update();

            if (this.currentTarget != null && !this.isMoveTweening() && !this.weapon.isBackSwinging() && !this.weapon.isFrontSwinging()) {
                if (this.inRangeOfTarget()) {
                    this.unsetCurrentPath();
                    this.attackTarget();
                    if (this.currentTarget.health <= 0) {
                        this.threatTable.removeThreatTarget(this.currentTarget);
                        this.currentTarget = <Enemy>this.threatTable.getHighestThreatTarget();
                        if (this.currentTarget == null) {
                            this.goHome();
                        }
                    }
                }
                else {
                    this.moveTowardsTarget();
                }
            }

            if (this.currentTarget == null && !this._pathing) {
                this.action = Actions.Standing;
                this.updateAnimation();
                this.currentTarget = <Enemy>this.threatTable.getHighestThreatTarget();
            }
        }

        private onHighestThreatTargetChanged(sprite: AnimatedSprite) {
            this.currentTarget = <Enemy>sprite;
            this.unsetCurrentPath();

            if (this.currentTarget == null) {
                this.goHome();
            }
        }

        private goHome() {
            var homePoint: Phaser.Point = this.startingPoint;

            var onComplete = () => {
                this.action = Actions.Standing;
                this.face(this.startingDirection);
            };

            if (!this.pathfindTo(homePoint, null, onComplete)) {
                onComplete();
            }
        }

        private moveTowardsTarget() {
            if (!this.alive || this.isMoveTweening()) {
                return;
            }

            this.pathfindTo(this.currentTarget.position, null,() => {

            });
        }

        private inRangeOfTarget(): boolean {
            var distance = Phaser.Point.distance(this, this.currentTarget);
            if (distance <= this.weapon.range) {
                return true;
            }

            return false;
        }

        private attackTarget() {
            if (!this.weapon.canFire) {
                return;
            }

            this.action = Actions.Firing;
            this.face(this.currentTarget);

            var distance = Phaser.Point.distance(this, this.currentTarget);
            if (distance <= this.weapon.range) {
                this.weapon.lastFireTime = this.game.time.now;

                this.currentTarget.inflictDamage(this.weapon.power, this);
            }
        }
    }
}