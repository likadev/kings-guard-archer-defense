// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    class AniamtedSpriteActivator<T> {
        constructor(private typ) { }

        getNew(game, x, y, key?, frame?): T {
            return new this.typ(game, x, y, key, frame);
        }
    }

    export class AnimationLoader {
        private static loadCount: number = 0;
        private static animationDataParsed: number = 0;

        /**
         *  Loads the assets for a spritesheet and returns the promise handler.
         */
        public static load<T>(name: string, callback: (createdSprite: T) => any, typ): void {
            var spritesUrl = 'assets/textures/characters/' + name + '.sprites';
            var animUrl = 'assets/textures/characters/' + name + '.anim';

            ++AnimationLoader.animationDataParsed;

            var spriteLoader = AnimationLoader.loadItem(spritesUrl);
            var animLoader = AnimationLoader.loadItem(animUrl);
            $.when(spriteLoader, animLoader).done((spriteXml, animXml) => {
                try {
                    return AnimationLoader.parseXml(name, spriteXml, animXml, callback, typ);
                }
                finally {
                    --AnimationLoader.animationDataParsed;
                }
            });
        }
        
        /**
         *  Checks if the animation loader has finished loading all animations.
         */
        public static get done(): boolean {
            return AnimationLoader.loadCount === 0 &&
                AnimationLoader.animationDataParsed === 0;
        }

        /**
         *  Parse spritesheet and animation XML data.
         */
        public static parseXml<T>(name, spriteXml, animXml, callback: (createdSprite: T) => any, typ): any {
            var game = Game.Instance;
            var image: { name: string; url: string } = null;
            $(spriteXml).find('img').each(function (idx, e) {
                var imgName = $(this).attr('name');
                var url = 'assets/textures/characters/' + imgName;
                image = { name: name, url: url };
            });

            var spriteDefinitions: SpriteDefinition[] = SpriteDefinition.fromXml(spriteXml);
            var animationDefinitions: AnimationDefinition[] = AnimationDefinition.fromXml(animXml);

            var animations: Array<{ name: string; frames: Array<string>; frameRate: number; loops: boolean }> = [];
            var frames = {};
            for (var i = 0, l = animationDefinitions.length; i < l; ++i) {
                var names = [];
                var anim = animationDefinitions[i];
                var delay = 1;
                var loops = anim.loops === 0;
                var cells = anim.cells;
                for (var j = 0, m = cells.length; j < m; ++j) {
                    var cell = cells[j];
                    var delay = Math.max(delay, cell.delay);
                    var sprites = cell.sprites;
                    for (var k = 0, n = sprites.length; k < n; ++k) {
                        var animSprite = sprites[k];
                        var sprite = AnimationLoader.lookup(animSprite.name, spriteDefinitions);
                        var filename = sprite.name;
                        var frameData = {
                            x: sprite.x,
                            y: sprite.y,
                            w: sprite.w,
                            h: sprite.h, 
                        };
                        var rotated = false;
                        var trimmed = true;
                        var sourceSize = {
                            w: sprite.w,
                            h: sprite.h,
                        };
                        var spriteSourceSize = {
                            x: animSprite.x,
                            y: animSprite.y,
                            w: sprite.w, // TODO: Modify by animSprite.z
                            h: sprite.h, // TODO: Modify by animSprite.z
                        };

                        var frameInfo = {
                            filename: filename,
                            frame: frameData,
                            rotated: rotated,
                            trimmed: trimmed,
                            spriteSourceSize: spriteSourceSize,
                            sourceSize: sourceSize,
                        };
                        names.push(filename);
                        frames[filename] = frameInfo;
                    }
                }

                animations.push({
                    name: anim.name, frames: names, frameRate: delay, loops: loops
                });
            }

            frames = { frames: frames };

            var keys = [];
            var filesToLoad = 0;

            var loader: Phaser.Loader = null;
            loader = game.load.image(image.name, image.url);
            keys.push(image.name);
            filesToLoad++;

            game.load.atlasJSONHash(name, image.url, null, frames);
            keys.push(name);
            filesToLoad++;

            var loaderCallback = null;
            loaderCallback = (p, key: string, successful: boolean, b, c) => {
                if (keys.indexOf(key) >= 0) {
                    filesToLoad--;
                }

                if (filesToLoad === 0) {
                    var activator = new AniamtedSpriteActivator<T>(typ);
                    var finalSprite: any = activator.getNew(game, 0, 0, name);
                    for (var i = 0, l = animations.length; i < l; ++i) {
                        var animation = animations[i];
                        var rate = animation.frameRate;
                        // Make darkEditor and Phaser animation play nicely together.
                        // In darkEditor, animation plays according to this speed:
                        // 1. Set the frame counter to <delay> (integer >= 1).
                        // 2. Every 30ms, decrement the frame counter by 1.
                        // 3. When the frame counter reaches 0, switch to a new frame.
                        // Therefore, if you set the delay to 10, the time per frame is 300ms. If it's 11, the time per frame is 330ms.
                        // Phaser takes the frameRate input and calculates the delay between frames like: 1000 / frameRate.
                        rate = 1000 / (30 - (30 * (1 - rate)));

                        finalSprite.animations.add(animation.name, animation.frames, rate, animation.loops);
                    }

                    loader.onFileComplete.remove(loaderCallback);

                    callback(finalSprite);
                }
            }
            
            loader.onFileComplete.add(loaderCallback);

            return null;
        }

        /**
         *  Looks for a sprite by name in a list of sprites.
         */
        private static lookup(name: string, sprites: SpriteDefinition[]): SpriteDefinition {
            var sprite: SpriteDefinition = null;

            for (var i = 0, l = sprites.length; i < l; ++i) {
                var testSprite: SpriteDefinition = sprites[i];
                if (testSprite.fullPath === name) {
                    sprite = testSprite;
                    break;
                }
            }

            return sprite;
        }

        /**
         *  Load an item and return an AJAX promise.
         */
        private static loadItem(url: string): JQueryPromise<{}> {
            ++AnimationLoader.loadCount;

            return $.ajax({
                url: url,
                async: true,
                dataType: "xml",
            }).done(AnimationLoader.handleItemLoaded)
                .fail(AnimationLoader.handleItemError);
        }

        /**
         *  Handler called once an item is loaded.
         */
        private static handleItemLoaded(item: JQueryPromiseCallback<{}>): void {
            --AnimationLoader.loadCount;
        }

        /**
         *  Handler called when an item fails to load.
         */
        private static handleItemError(item: JQueryPromiseCallback<{}>): void {
            --AnimationLoader.loadCount;

            console.error(item);
        }
    }
}