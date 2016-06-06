/*jslint browser this for */
/*global angular alert console */

(function () {
    'use strict';

    var filters = angular.module('my_snapchat.filters', []);

    filters.filter('leftpad', function () {
        return function (number, length) {
            if (!number) {
                return number;
            }

            number = '' + number;
            while (number.length < length) {
                number = '0' + number;
            }
            return number;
        };
    });

    filters.filter('countSnaps', function () {
        return function (nb) {
            if (nb > 0) {
                return '<span class="snap-counter">' + nb + '</span>';
            }
        };
    });
}());