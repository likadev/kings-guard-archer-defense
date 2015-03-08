// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class PrepareDefenseController extends GameController {
        private purchaseMenu: PurchaseMenu;

        constructor(children?: GameController[], parent?: GameController) {
            super(children, parent);

            this.purchaseMenu = new PurchaseMenu([], this);
            this.children.push(this.purchaseMenu);
        }

        init(context: GameContext): void {
            super.init(context);

            var spawnPoint = this.map.toPixels(this.map.heroSpawnPoint);
            this.hero.pathfindTo(spawnPoint, null,() => {
                this.hero.face(Directions.Down);
            });
            Input.disablePlayerInput(this.hero);
        }

        preload(): void {
            super.preload();
        }

        create(): void {
            super.create();

            AnimationHelper.createTextPopup("PREPARE YOUR DEFENSE");
            //AnimationHelper.createTextSubPopup("THIS IS ONLY A PLACEHOLDER FOR NOW");

            var spawnPoint = this.map.toPixels(this.map.heroSpawnPoint).add(16, 16);
            var invisSprite = this.game.add.sprite(this.hero.x, this.hero.y);
            invisSprite.visible = false;
            this.camera.follow(invisSprite);

            var moveToCenter = this.game.add.tween(invisSprite).to({ x: spawnPoint.x, y: spawnPoint.y }, 1000, Phaser.Easing.Linear.None, false, 500);
            moveToCenter.onComplete.addOnce(() => {
                (<any>this.camera).unfollow();
                invisSprite.kill();
            });
            moveToCenter.start();

            /*this.game.time.events.add(5000,() => {
                this.switchTo('SimulationController');
            }, this);*/
        }

        update(): void {
            super.update();

            var Key = Phaser.Keyboard;

            if (this.game.input.keyboard.isDown(Key.LEFT)) {
                this.game.camera.x -= 125 * this.game.time.physicsElapsed;
            }
            else if (this.game.input.keyboard.isDown(Key.RIGHT)) {
                this.game.camera.x += 125 * this.game.time.physicsElapsed;
            }

            if (this.game.input.keyboard.isDown(Key.UP)) {
                this.game.camera.y -= 125 * this.game.time.physicsElapsed;
            }
            else if (this.game.input.keyboard.isDown(Key.DOWN)) {
                this.game.camera.y += 125 * this.game.time.physicsElapsed;
            }

            if (this.purchaseMenu.ready) {
                GameController.switchTo('SimulationController');
            }
        }

        destroy(): void {
            super.destroy();

            //Input.enablePlayerInput(this.hero);
        }
    }
}