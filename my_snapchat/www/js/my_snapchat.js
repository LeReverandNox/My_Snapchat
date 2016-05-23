/*jslint browser this for */
/*global angular alert cordova window StatusBar*/

(function () {
    'use strict';
    var my_snapchat = angular.module('my_snapchat', [
        'ionic',
        'my_snapchat.controllers',
        'my_snapchat.services'
    ]);

    my_snapchat.run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });
}());