// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export interface GameContextProperties {
        game?: Game;

        map?: GameMap;

        actors?: Actors;

        script?: ScriptEngine;

        grid?: OccupiedGrid;

        projectiles?: ProjectileManager;

        gameComplete?: boolean;

        skillChallengeMode?: boolean;
    }

    export class GameContext implements GameContextProperties {
        constructor(props: GameContextProperties) {
            $.extend(this, props);
        }
    }
}