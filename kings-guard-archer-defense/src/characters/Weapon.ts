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
        private deadKey: string;
        private frontSwingTime: number;
        public cooldown: number;
        public projectileSpeed: number;
        public power: number;
        public aliveTime: number;
        public chargeSprite: AnimatedSprite;
        public frontSwing: number = 0;
        public backSwing: number = 0;
        public range: number = 32;

        constructor(public game: Phaser.Game, public key: string, opts?: WeaponOptions) {
            this.setOptions(opts);

            this.lastFire = 0;
            this.chargeTime = 0;
            this.charging = false;
            this.minimumChargeTime = 240;
            this.fullChargeTime = 1000;
        }

        private setOptions(opts?: WeaponOptions) {
            opts = opts || {};

            this.frontSwing = opts.frontSwing || 0;

            this.backSwing = opts.backSwing || 0;

            this.range = opts.range || GameMap.TILE_WIDTH;

            this.deadKey = opts.deadProjectileKey || null;

            this.chargeSprite = opts.chargeSprite || null;

            this.projectileSpeed = opts.projectileSpeed || 1;

            this.power = opts.power || 1;

            this.aliveTime = opts.aliveTime || 5000;

            this.cooldown = opts.cooldown || 0;

            this.minimumChargeTime = opts.chargeTime || 240;

            this.fullChargeTime = opts.fullChargeTime || 1000;
        }

        public get deadProjectileKey(): string {
            return this.deadKey;
        }

        public set deadProjectileKey(key: string) {
            this.deadKey = key;
        }

        public get canFire(): boolean {
            return this.game.time.now - this.lastFire > this.cooldown;
        }

        public set lastFireTime(time: number) {
            this.lastFire = time;
        }

        public isBackSwinging(): boolean {
            var delta = this.game.time.now - this.lastFire;
            return !(delta >= this.backSwing);
        }

        public isFrontSwinging(): boolean {
            var delta = this.game.time.now - this.frontSwingTime;
            return delta < this.frontSwing;
        }

        public startFrontSwinging(): boolean {
            this.frontSwingTime = this.game.time.now;
            return this.isFrontSwinging();
        }

        public isCharging(): boolean {
            this.chargeTime = this.game.time.now - this.chargeStartTime;
            if (this.chargeTime >= this.minimumChargeTime) {
                return this.charging;
            }
            else {
                return false;
            }
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

        public preload(): void {
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

        update(owner?: AnimatedSprite): void {
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