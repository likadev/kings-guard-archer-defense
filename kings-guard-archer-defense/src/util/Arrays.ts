// Copyright (c) 2015, likadev. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

module KGAD {
    /**
     *  Contains a set of static utility functions for arrays.
     */
    export class Arrays {
        /**
         *  Shuffles an array in-place randomly.
         */
        public static shuffle<T>(arr: T[]): T[] {
            var counter = arr.length,
                temp: T,
                index: number;

            while (counter > 0) {
                index = Math.floor(Math.random() * counter--);

                temp = arr[counter];
                arr[counter] = arr[index];
                arr[index] = temp;
            }

            return arr;
        }

        /**
         *  Removes an element from an array.
         */
        public static remove<T>(value: T, arr: T[]): T {
            var idx = $.inArray(value, arr);
            if (idx >= 0) {
                return arr.splice(idx, 1)[0];
            }

            return null;
        }

        /**
         *  Removes multiple elements from an array.
         */
        public static removeAll<T>(values: T[], arr: T[]): T[]{
            var result: T[] = [];

            for (var i = 0, l = values.length; i < l; ++i) {
                var removed = Arrays.remove(values[i], arr);
                if (removed != null) {
                    result.push(removed);
                }
            }

            return result;
        }
    }
}
