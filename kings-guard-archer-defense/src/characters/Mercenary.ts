// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/AnimatedSprite.ts" />
/// <reference path="Weapon.ts" />

module KGAD {
    export class Mercenary extends AnimatedSprite {
        private threatTable: ThreatTable;
        protected startingPoint: Phaser.Point;
        protected damageTween: Phaser.Tween;
        protected currentTarget: Enemy;
        protected engageRange: number;
        protected weapon: Weapon;

        constructor(game: Phaser.Game, x: number, y: number, key?: string, frame?: any) {
            super(game, x, y, key, frame);

            this.movementSpeed = 50;
            this.health = 3;
            this.engageRange = 64;
        }

        init(...args: any[]) {
            this.weapon = new Weapon(this.game, 'short_sword', {
                cooldown: 1500,
                range: 33,
                backSwing: 500,
                power: 1,
            });

            this.threatTable = new ThreatTable(this);
            this.threatTable.highestThreatChanged.add((sprite) => { this.onHighestThreatTargetChanged(sprite); });
            AnimationLoader.addAnimationToSprite(this, this.key);
        }

        addToWorld(): void {
            super.addToWorld();

            this.startingPoint = new Phaser.Point(this.x, this.y);
        }

        public checkThreatAgainst(enemy: Enemy): void {
            var distance = Phaser.Point.distance(this.startingPoint, enemy);
            if (distance <= this.engageRange) {
                var threat = (Math.max(1,(this.engageRange - distance)) / this.engageRange) * 0.075;
                this.threatTable.addThreat(enemy, threat);
            }
            else {
                this.threatTable.addThreat(enemy, -0.1);
            }
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
            var dead = !this.alive || !this.exists || this.health <= 0;

            if (dead || this.weapon.isBackSwinging()) {
                return;
            }

            this.threatTable.update();

            if (this.currentTarget != null) {
                this.action = Actions.Firing;
                this.face(this.currentTarget);
                this.updateAnimation();
                this.attackTarget();

                if (this.currentTarget.health <= 0) {
                    this.currentTarget = null;
                }
            }

            if (this.currentTarget == null) {
                this.action = Actions.Standing;
                this.updateAnimation();
                this.currentTarget = <Enemy>this.threatTable.getHighestThreatTarget();
            }
        }

        private onHighestThreatTargetChanged(sprite: AnimatedSprite) {
            this.currentTarget = <Enemy>sprite;
        }

        private attackTarget() {
            if (!this.weapon.canFire) {
                return;
            }

            var distance = Phaser.Point.distance(this, this.currentTarget);
            if (distance <= this.weapon.range) {
                this.weapon.lastFireTime = this.game.time.now;

                this.currentTarget.inflictDamage(this.weapon.power, this);
            }
        }
    }
}