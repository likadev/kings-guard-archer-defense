// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export interface TextOptions {
        x?: number;

        y?: number;

        centered?: boolean;

        centeredX?: boolean;

        centeredY?: boolean;

        style?: { fill?: string; font?: string; align?: string; };

        fixedToCamera?: boolean;

        addToWorld?: boolean;
    }

    /**
     *  Contains a set of static utility functions for text manipulation.
     */
    export class Text {
        /**
         *  Gets or sets the default text style.
         */
        public static defaultStyle = {
            fill: "#FFFFFF",
            font: "16px MedievalSharpBook",
            align: "left"
        };

        /**
         *  Creates a text object.
         */
        public static createText(text: string, opts?: TextOptions): Phaser.Text {
            opts = opts || {};

            var x = opts.x || 0;
            var y = opts.y || 0;
            var styles = $.extend({}, Text.defaultStyle, opts.style);

            var game = Game.Instance;
            var width = Game.Width;
            var height = Game.Height;

            var textObject: Phaser.Text = game.make.text(x, y, text, styles);
            if (!!opts.centered) {
                textObject.x = (width / 2) - (textObject.width / 2);
                textObject.y = (height / 2) - (textObject.height / 2);
            }
            else {
                if (!!opts.centeredX) {
                    textObject.x = (width / 2) - (textObject.width / 2);
                }

                if (!!opts.centeredY) {
                    textObject.y = (height / 2) - (textObject.height / 2);
                }
            }

            textObject.fixedToCamera = !!opts.fixedToCamera;

            if (!!opts.addToWorld) {
                game.world.add(textObject);
            }

            return textObject;
        }

        /**
         *  Create multiple text lines.
         */
        public static createLines(text: string[], opts?: TextOptions, spacing: number = 0) {
            opts = opts || {};
            var lines: Phaser.Text[] = [];
            var originalY = opts.y || 0;

            opts.y = originalY;
            for (var i = 0, l = text.length; i < l; ++i) {
                var textObject = Text.createText(text[i], opts);
                opts.y += textObject.height + spacing;
                lines.push(textObject);
            }

            opts.y = originalY;

            return lines;
        }

        /**
         *  Measures the width and height (in pixels) of the given text.
         */
        public static measureText(text: string, fontSizePixels: number = 16): { width: number; height: number; } {
            var styles = $.extend({}, Text.defaultStyle, { font: (fontSizePixels | 0).toString() + "px MedievalSharpBook" });
            var game = Game.Instance;

            var textObject = game.make.text(0, 0, text, styles);
            var measurements = {
                width: textObject.width,
                height: textObject.height
            };
            textObject.destroy();

            return measurements;
        }
    }
}