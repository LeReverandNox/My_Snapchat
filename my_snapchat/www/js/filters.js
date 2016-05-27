/*jslint browser this for */
/*global angular alert */

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
}());