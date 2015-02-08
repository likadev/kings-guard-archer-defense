// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class AnimationDefinition {
        constructor(public name: string, public loops: number, public cells: AnimationCellDefinition[]) {

        }

        /**
         *  Parses animation data from a darkEditor animation XML file.
         */
        public static fromXml(animXml): AnimationDefinition[] {
            var animations: AnimationDefinition[] = [];

            $(animXml).find('anim').each(function (idx, el) {
                var name: string = $(this).attr('name');
                var loops: number = parseInt($(this).attr('loops'), 10);

                var cells: AnimationCellDefinition[] = [];
                $('> cell', $(this)).each(function (i, e) {
                    var index: number = parseInt($(this).attr('index'), 10);
                    var delay: number = parseInt($(this).attr('delay'), 10);

                    var sprites: AnimationSpriteDefinition[] = [];
                    $('> spr', $(this)).each(function (iidx, eel) {
                        var spriteName: string = $(this).attr('name');
                        var x: number = parseInt($(this).attr('x'), 10);
                        var y: number = parseInt($(this).attr('y'), 10);
                        var z: number = parseInt($(this).attr('z'), 10);

                        var sprite = new AnimationSpriteDefinition(spriteName, x, y, z);
                        sprites.push(sprite);
                    });

                    var cell = new AnimationCellDefinition(index, delay, sprites);
                    cells.push(cell);
                });

                var animation = new AnimationDefinition(name, loops, cells);
                animations.push(animation);
            });

            return animations;
        }
    }
}