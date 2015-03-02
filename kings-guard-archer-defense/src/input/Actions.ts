// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    export class Actions {
        public static get Standing() { return 'face'; }

        public static get Moving() { return 'walk'; }

        public static get Frontswinging() { return 'frontswing'; }

        public static get Charging() { return 'charge'; }

        public static get ChargeWalking() { return 'charge_walk'; }

        public static get Firing() { return 'fire'; }

        public static get Backswinging() { return 'backswing'; }

        public static get Casting() { return 'cast'; }

        public static get Damaged() { return 'damaged'; }

        public static get Dying() { return 'dying'; }

        public static get Dead() { return 'dead'; }
    }
}