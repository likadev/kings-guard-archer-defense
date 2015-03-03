// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="AnimatedSprite.ts" />

module KGAD {
    export class HealthBar {
        private parent: AnimatedSprite;
        private game: Phaser.Game;
        private healthBarFrame: Phaser.Sprite;
        private _healthBar: Phaser.Sprite;
        private _maxHealth: number;
        private _lastHealth: number;
        private fullWidth: number;
        private _visible: boolean;
        private position: Phaser.Point;

        constructor(game: Phaser.Game, parent: AnimatedSprite) {
            this.game = game;
            this.parent = parent;
            this.position = new Phaser.Point();
        }

        public get maxHealth(): number {
            return this._maxHealth;
        }

        public set maxHealth(_maxHealth) {
            this._maxHealth = _maxHealth;
        }

        public get visible(): boolean {
            return this.healthBarFrame.visible;
        }

        public set visible(_visible: boolean) {
            this._visible = _visible;
            this.healthBarFrame.visible = _visible;
            this._healthBar.visible = _visible;
        }

        init(maxHealth: number): void {
            this.healthBarFrame = this.game.make.sprite(0, 0, 'healthbar_frame');
            this._healthBar = this.game.make.sprite(0, 0, 'healthbar');

            this.healthBarFrame.visible = false;
            this._healthBar.visible = false;
            this.healthBarFrame.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            this._healthBar.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
            (<any>this.healthBarFrame).renderPriority = 2;
            (<any>this._healthBar).renderPriority = 1;

            this.game.world.add(this.healthBarFrame);
            this.game.world.add(this._healthBar);

            this.visible = false;

            this.fullWidth = this._healthBar.width;
            this.maxHealth = maxHealth || 1;
            this.updateHealthBarValue();
            this.updatePosition();
        }

        update(): void {
            if (this._visible) {
                this.updatePosition();
                this.updateHealthBarValue();
            }
        }

        destroy(): void {
            this.visible = false;

            this.healthBarFrame.destroy();
            this._healthBar.destroy();
        }

        private updatePosition() {
            var parent = this.parent;

            var x = parent.position.x - (32 * parent.anchor.x);
            var y = parent.position.y - (32 * parent.anchor.y) - this.healthBarFrame.height - 5;

            this.position.set(x, y);

            this.healthBarFrame.position.set(x, y);
            this._healthBar.position.set(x, y);

            //this._healthBar.bringToTop();
            //this.healthBarFrame.bringToTop();
        }

        private updateHealthBarValue() {
            var parent = this.parent;
            var health = parent.health;
            if (health > this.maxHealth) {
                this.maxHealth = health;
            }

            var percent = Phaser.Math.clamp(health / this.maxHealth, 0, 1);

            this._healthBar.visible = health > 0 && parent.exists && parent.alive && percent < 1;
            this.healthBarFrame.visible = health > 0 && parent.exists && parent.alive && percent < 1;

            if (health > 0) {
                this._healthBar.width = this.fullWidth - Math.ceil(this.fullWidth * (1 - percent));

                if (percent > 0.5) {
                    this._healthBar.tint = 0x00FF00;
                }
                else if (percent > 0.2 && percent <= 0.5) {
                    this._healthBar.tint = 0xFFFF00;
                }
                else if (percent <= 0.2) {
                    this._healthBar.tint = 0xFF0000;
                }
            }
        }
    }
}