// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class Weapon {
        private lastFire: number;
        private group: Phaser.Group;
        private charging: boolean;
        private chargeTime: number;
        private chargeStartTime: number;
        private minimumChargeTime: number;
        private fullChargeTime: number;

        constructor(public game: Phaser.Game, public key: string, public cooldown: number, public projectileSpeed: number = 0,
            public power: number = 1, public aliveTime: number = 5000, public chargeSprite: AnimatedSprite = null) {
            this.lastFire = 0;
            this.charging = false;
            this.chargeTime = 0;
            this.minimumChargeTime = 150;
            this.fullChargeTime = 1000;
        }

        preload(): void {
            
            if (!this.game.cache.checkImageKey(this.key)) {
                var url: string = 'assets/textures/weapons/' + this.key + '.png';
                this.game.load.image(this.key, url);
            }

            if (this.chargeSprite != null) {
                this.chargeSprite.canOccupyTiles = false;
                this.chargeSprite.preload();
                this.chargeSprite.init();
                this.chargeSprite.visible = false;
            }
        }

        public get canFire(): boolean {
            return this.game.time.now - this.lastFire > this.cooldown;
        }

        public set lastFireTime(time: number) {
            this.lastFire = time;
        }

        public isCharging(): boolean {
            this.chargeTime = this.game.time.now - this.chargeStartTime;
            if (this.chargeTime >= this.minimumChargeTime) {
                return this.charging;
            }
            else {
                return false;
            }
            //return this.charging;
        }

        public get currentPower(): number {
            this.chargeTime = (this.game.time.now - this.chargeStartTime) - this.minimumChargeTime;
            var halfChargeTime = this.fullChargeTime / 2;

            if (this.chargeTime > this.fullChargeTime) {
                this.chargeTime = this.fullChargeTime;
            }

            if (this.chargeTime < this.minimumChargeTime) {
                this.chargeTime = 0;
            }

            return this.chargeTime / halfChargeTime;
        }

        public startCharging() {
            this.charging = true;
            this.chargeTime = 0;
            this.chargeStartTime = this.game.time.now;
        }

        public stopCharging(): number {
            var power = this.currentPower;
            this.cancelCharging();
            return power;
        }

        public cancelCharging(): void {
            this.charging = false;
            this.chargeTime = 0;
            if (this.chargeSprite != null) {
                this.chargeSprite.animations.stop();
                this.chargeSprite.visible = false;
            }

        }

        update(owner?: AnimatedSprite): void {
            this.game.physics.arcade.collide(this.group, Game.CurrentMap.collisionLayer);

            if (this.chargeSprite != null) {
                var currentAnim = this.chargeSprite.animations.currentAnim;
                if (this.isCharging() && (currentAnim == null || !currentAnim.isPlaying || !this.chargeSprite.visible)) {
                    this.chargeSprite.visible = true;
                    this.chargeSprite.animations.play('mini_charge_down');
                    this.game.add.existing(this.chargeSprite);
                }

                if (this.chargeSprite.visible) {
                    var anglePoint = MovementHelper.getPointFromDirection(owner.direction).multiply(15, 15);
                    var position = Phaser.Point.add(anglePoint, owner.position);
                    this.chargeSprite.position = position;

                    if (this.currentPower >= 2) {
                        this.chargeSprite.animations.play('charge_down');
                    }
                }
            }
        }
    }
}