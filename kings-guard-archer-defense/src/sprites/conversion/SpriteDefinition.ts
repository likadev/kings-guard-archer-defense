// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class SpriteDefinition {
        constructor(public fullPath: string, public x: number, public y: number, public w: number, public h: number) {
        }

        /**
         *  Gets the full name of the sprite, including the path to the spritesheet.
         */
        public get name(): string {
            return this.fullPath;
        }

        /**
         *  Gets the name of the sprite without the path.
         */
        public get nameOnly(): string {
            var i = this.fullPath.lastIndexOf('/');
            if (i < 0) {
                return this.fullPath;
            }

            return this.fullPath.substr(i + 1);
        }

        /**
         *  Parses XML created by the darkEditor software.
         */
        public static fromXml(spriteXml): SpriteDefinition[] {
            var $img = $(spriteXml).find('img');
            var sprites: Array<SpriteDefinition> = [];
            $img.each(function (index: number, elem: Element) {
                var imgName: string = $(this).attr('name');
                var imgWidth: number = parseInt($(this).attr('w'), 10);
                var imgHeight: number = parseInt($(this).attr('h'), 10);

                var $definitions = $(this).find('definitions').first();

                var allSprites: Array<SpriteDefinition> = SpriteDefinition.findSprites($definitions, '');
                sprites = sprites.concat(allSprites);
            });

            return sprites;
        }

        /**
         *  Loops through the <dir> elements of the XML file and grabs all of the sprites.
         */
        private static findSprites($rootDir: JQuery, dirName: string, sprites: SpriteDefinition[] = []): SpriteDefinition[] {
            $('> dir', $rootDir).each(function(i, e) {
                var subDirName = dirName + $(this).attr('name');
                if (!subDirName.match(/\/$/)) {
                    subDirName += '/';
                }

                $('> spr', $(this)).each(function (idx: number, el: Element) {
                    var fullPath = subDirName + $(this).attr('name');
                    var x: number = parseInt($(this).attr('x'), 10);
                    var y: number = parseInt($(this).attr('y'), 10);
                    var w: number = parseInt($(this).attr('w'), 10);
                    var h: number = parseInt($(this).attr('h'), 10);

                    sprites.push(new SpriteDefinition(fullPath, x, y, w, h));
                });

                sprites = SpriteDefinition.findSprites($(this), subDirName, sprites);
            });

            return sprites;
        }
    }
}