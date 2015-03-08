// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.


module KGAD {
    export class ProjectileManager {
        private activeProjectiles: Array<FiredProjectile>;
        private inactiveProjectiles: Array<FiredProjectile>;
        private groups: { [key: string]: Phaser.Group };
        private debugLastRay: Phaser.Line;
        private debugFirstTile: Phaser.Rectangle;

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

        public getActiveProjectilesThatCantPassThroughWalls(): Array<FiredProjectile> {
            var firedProjectiles = [];

            for (var i = 0, l = this.activeProjectiles.length; i < l; ++i) {
                var active = this.activeProjectiles[i];
                if (!active.goThroughWalls) {
                    firedProjectiles.push(active);
                }
            }

            return firedProjectiles;
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
        public fire(x: number, y: number, who: AnimatedSprite, weapon: Weapon, chargePower: number, angle?: number, goThroughWalls: boolean = false, onKill?: () => any): void {
            var game = Game.Instance;
            var map = Game.CurrentMap;
            var direction = who.direction;
            var p: Phaser.Point = MovementHelper.getPointFromDirection(direction);
            var projectileStartPosition = Phaser.Point.add(who.position, p);
            var group = this.getGroupByType(weapon.key);
            var rotation = angle || MovementHelper.getAngleFromDirection(direction);

            var sprite: FiredProjectile = group.create(x, y, weapon.key);
            if (weapon.deadProjectileKey) {
                sprite.deadSpriteKey = weapon.deadProjectileKey;
            }
            sprite.lifespan = weapon.aliveTime;
            sprite.rotation = rotation;
            sprite.direction = direction;
            sprite.renderPriority = -1;
            sprite.goThroughWalls = goThroughWalls;

            sprite.init(weapon, who, chargePower);
            sprite.body.rotation = sprite.rotation;
            sprite.body.width = sprite.body.width - 1;
            sprite.body.height = sprite.body.height - 1;
            game.physics.arcade.velocityFromAngle(sprite.angle, sprite.speed, sprite.body.velocity);

            var distX = sprite.body.velocity.x * (weapon.aliveTime / 1000);
            var distY = sprite.body.velocity.y * (weapon.aliveTime / 1000);

            var ray = new Phaser.Line(sprite.x, sprite.y, sprite.x + distX, sprite.y + distY);
            ray.end.x = Phaser.Math.clamp(ray.end.x, 0, map.widthInPixels);
            ray.end.y = Phaser.Math.clamp(ray.end.y, 0, map.heightInPixels);

            var pixelPoint: Phaser.Point = new Phaser.Point();
            var tile = CollisionHelper.raycastFirstTile(ray, 4, pixelPoint);
            var aliveTime = weapon.aliveTime;
            
            if (!goThroughWalls && tile) {
                aliveTime = (Phaser.Point.distance(sprite.position, pixelPoint) / sprite.speed) * 1000;
                sprite.hitWallPoint = pixelPoint;
            }

            sprite.aliveTime = aliveTime;

            game.time.events.add(aliveTime,() => {
                this.makeInactive(sprite);
            }, this);

            this.activeProjectiles.push(sprite);
        }

        update(): void {
            var game = Game.Instance;

            game.physics.arcade.collide(this.getActiveProjectilesThatCantPassThroughWalls(), Game.CurrentMap.collisionLayer,(proj) => { this.onProjectileHitWall(proj); });
            /*game.physics.arcade.overlap(this.activeProjectiles, Game.CurrentMap.collisionLayer,(proj) => {
                this.onProjectileHitWall(proj);
            });*/

            /*for (var i = 0, l = this.activeProjectiles.length; i < l; ++i) {
                this.activeProjectiles[i].update();
            }

            for (i = 0, l = this.inactiveProjectiles.length; i < l; ++i) {
                this.inactiveProjectiles[i].update();
            }*/
        }

        render(): void {
            /*if (this.debugLastRay) {
                Game.Instance.debug.geom(this.debugLastRay);
                Game.Instance.debug.geom(this.debugFirstTile, '#FF9999', true);
            }*/
        }

        private onProjectileHitWall(proj: FiredProjectile) {
            proj.hitWall();
            this.makeInactive(proj);
        }
    }
}