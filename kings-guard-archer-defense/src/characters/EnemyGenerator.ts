// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

/// <reference path="../sprites/conversion/EnemySpecification.ts" />

module KGAD {
    export class EnemyGenerator {
        public enemyTypes: EnemySpecification[];
        public groups: { [name: string]: Phaser.Group; };
        public enemies: Array<Enemy> = [];

        constructor(types: EnemySpecification[] = []) {
            this.enemyTypes = types;
            this.groups = {};
        }

        public addType(enemy: EnemySpecification) {
            if (this.enemyTypes.indexOf(enemy) < 0) {
                this.enemyTypes.push(enemy);
                this.createGroup(enemy);
            }
        }

        public create(enemy: EnemySpecification|string, x: number, y: number): AnimatedSprite {
            var enemyType: EnemySpecification = null;

            if (typeof enemy === 'string') {
                for (var i = 0, l = this.enemyTypes.length; i < l; ++i) {
                    var enemyTyp = this.enemyTypes[i];
                    if (enemyTyp.key === enemy) {
                        enemyType = enemyTyp;
                        break;
                    }
                }
            }
            else if (enemy instanceof EnemySpecification) {
                enemyType = enemy;
            }
            else {
                throw new Error("Unknown parameter: " + enemy);
            }

            var game = Game.Instance;
            var group = this.groups[enemyType.key];
            //var sprite: Enemy = group.create(x, y, enemyType.key);
            var sprite: Enemy = new Enemy(game, x, y, enemyType.key);
            AnimationLoader.addAnimationToSprite(sprite, enemyType.key);

            var king = GameInfo.CurrentGame.king;
            var angle = game.physics.arcade.angleBetween(king, sprite);
            sprite.init(enemyType);
            sprite.addToWorld();
            sprite.direction = MovementHelper.getDirectionFromAngle(angle);
            sprite.updateAnimation();

            this.enemies.push(sprite);

            return sprite;
        }

        /**
         *  Creates a Phaser group, which will generate the sprites.
         */
        private createGroup(enemy: EnemySpecification) {
            var game = Game.Instance;
            var group = game.add.group(null, 'enemy_' + enemy.key);
            group.enableBody = true;
            group.physicsBodyType = Phaser.Physics.ARCADE;
            group.classType = Enemy;

            this.groups[enemy.key] = group;
        }

        /**
         *  Remove an enemy from the list of enemies.
         */
        public killEnemy(enemy: Enemy): Enemy {
            var removedEnemy: Enemy = null;
            var index = this.enemies.indexOf(enemy);
            if (index >= 0) {
                removedEnemy = this.enemies.splice(index, 1)[0];
            }

            return removedEnemy;
        }

        update() {
            var enemiesToRemove: Array<Enemy> = [];

            for (var i = 0, l = this.enemies.length; i < l; ++i) {
                var enemy: Enemy = this.enemies[i];

                if (!enemy.alive || !enemy.exists) {
                    enemiesToRemove.push(enemy);
                }

                enemy.update();
            }

            for (i = 0, l = enemiesToRemove.length; i < l; ++i) {
                this.killEnemy(enemiesToRemove[i]);
            }

            var game = Game.Instance;
            game.physics.arcade.collide(this.enemies, this.enemies);

            for (var key in this.groups) {
                if (this.groups.hasOwnProperty(key)) {
                    var group = this.groups[key];
                    game.physics.arcade.collide(group, group);
                }
            }
        }
    }
}