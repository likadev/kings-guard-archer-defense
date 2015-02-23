// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.


module KGAD {
    export class ProjectileManager {
        private activeProjectiles: Array<FiredProjectile>;
        private inactiveProjectiles: Array<FiredProjectile>;
        private groups: { [key: string]: Phaser.Group };

        constructor() {
            this.activeProjectiles = [];
            this.inactiveProjectiles = [];
            this.groups = {};
        }

        preload() {
            
        }

        /**
         *  Gets all active projectiles on the field.
         */
        public getActiveProjectiles(): Array<FiredProjectile> {
            return this.activeProjectiles;
        }

        /**
         *  Gets all groups associated with this generator.
         */
        public getGroups(): Phaser.Group[] {
            var groups: Array<Phaser.Group> = [];

            for (var key in this.groups) {
                if (this.groups.hasOwnProperty(key)) {
                    var group = this.groups[key];
                    groups.push(group);
                }
            }

            return groups;
        }

        /**
         *  Gets a group by the projectile type.
         */
        public getGroupByType(key: string) {
            if (!this.groups[key]) {
                this.createGroup(key);
            }

            return this.groups[key];
        }

        /**
         *  Creates a new group used to generate projectiles.
         */
        private createGroup(key: string) {
            var game = Game.Instance;
            var group = game.add.group();
            group.classType = FiredProjectile;

            this.groups[key] = group;
        }

        /**
         *  Turn an active projectile into an inactive one.
         */
        private makeInactive(proj: FiredProjectile): boolean {
            var index = this.activeProjectiles.indexOf(proj);
            if (index >= 0) {
                this.activeProjectiles.splice(index, 1)
                this.inactiveProjectiles.push(proj);

                return true;
            }

            return false;
        }

        /**
         *  Kills a projectile and remove it from the list of projectiles.
         */
        public killProjectile(proj: FiredProjectile): FiredProjectile {
            var game = Game.Instance;
            var index = this.activeProjectiles.indexOf(proj);
            var deleted: FiredProjectile[] = null;
            if (index >= 0) {
                deleted = this.activeProjectiles.splice(index, 1);
            }

            index = this.inactiveProjectiles.indexOf(proj);
            if (index >= 0) {
                deleted = this.inactiveProjectiles.splice(index, 1);
            }

            if (!proj.dead || index >= 0) {
                game.add.tween(proj).to({ alpha: 0 }, 250).start().onComplete.addOnce(() => {
                    proj.kill();
                });
            }

            return deleted == null || deleted.length === 0 ? null : deleted[0];
        }

        /**
         *  Fire a projectile.
         */
        public fire(x: number, y: number, who: AnimatedSprite, weapon: Weapon, chargePower: number, onKill?: () => any): void {
            var game = Game.Instance;
            var direction = who.direction;
            var p: Phaser.Point = MovementHelper.getPointFromDirection(direction);
            var projectileStartPosition = Phaser.Point.add(who.position, p);
            var group = this.getGroupByType(weapon.key);

            var sprite: FiredProjectile = group.create(x, y, weapon.key);
            sprite.rotation = Phaser.Point.angle(MovementHelper.getPointFromDirection(direction), new Phaser.Point());
            sprite.init(weapon, who, chargePower);
            sprite.body.rotation = sprite.rotation;
            sprite.body.width = sprite.body.width - 1;
            sprite.body.height = sprite.body.height - 1;

            game.physics.arcade.velocityFromAngle(sprite.angle, sprite.speed, sprite.body.velocity);

            setTimeout(() => {
                this.killProjectile(sprite);
            }, weapon.aliveTime);

            this.activeProjectiles.push(sprite);
        }

        update(): void {
            var game = Game.Instance;

            game.physics.arcade.collide(this.activeProjectiles, Game.CurrentMap.collisionLayer,(proj) => { this.onProjectileHitWall(proj); });
            game.physics.arcade.overlap(this.activeProjectiles, Game.CurrentMap.collisionLayer,(proj) => {
                this.onProjectileHitWall(proj);
            });

            for (var i = 0, l = this.activeProjectiles.length; i < l; ++i) {
                this.activeProjectiles[i].update();
            }

            for (i = 0, l = this.inactiveProjectiles.length; i < l; ++i) {
                this.inactiveProjectiles[i].update();
            }
        }

        private onProjectileHitWall(proj: FiredProjectile) {
            this.makeInactive(proj);
        }
    }
}