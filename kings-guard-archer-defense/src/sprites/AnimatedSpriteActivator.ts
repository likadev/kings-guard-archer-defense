// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class AniamtedSpriteActivator<T> {
        constructor(private typ) { }

        getNew(game, x, y, key?, frame?): T {
            return new this.typ(game, x, y, key, frame);
        }
    }
}