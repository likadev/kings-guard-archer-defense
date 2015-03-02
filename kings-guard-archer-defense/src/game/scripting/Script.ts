// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export interface EnemyType {
        key: string;
        priority?: number;
    }

    export interface Sequence {
        addEnemyTypes?: EnemyType[];
        removeEnemyTypes?: string[];
        every?: number;
        times?: number;
        delay?: number;
        boss?: boolean;
        spawnPointName?: string;
    }

    export interface Wave {
        delay?: number;
        sequence?: Sequence[];
    }

    export interface Script {
        waves?: Wave[];
    }

    export interface Scripts {
        [level: string]: Script;
    }
}