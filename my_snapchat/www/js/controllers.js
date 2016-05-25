/*jslint browser this for */
/*global angular alert */

(function () {
    'use strict';

    var controllers = angular.module('my_snapchat.controllers', []);

    controllers.controller('AppCtrl', function () {
        console.log("App");
    });

    controllers.controller('IndexCtrl', function ($scope, UserService, $location) {
        var credentials = UserService.loadCredentials();
        if (credentials) {
            $location.path('/home/options');
        }
    });

    controllers.controller('RegiLogCtrl', function ($scope, UserService, $ionicPopup, $location) {
        $scope.user = {};

        $scope.register = function (user) {
            UserService.register(user, function (response) {
                if (response.data.error === true) {
                    $ionicPopup.alert({
                        title: 'Hurray !',
                        template: 'You\'re now registered on My_Snapchat !'
                    }).then(function () {
                        $scope.user = {};
                        $location.path('/');
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: response.data.error
                    }).then(function () {
                        $scope.user = {};
                    });
                }
            });
        };

        $scope.login = function (user) {
            UserService.login(user, function (response) {
                if (response.data.error === true) {
                    var credentials = {};
                    credentials.token = response.data.token;
                    credentials.id = JSON.parse(response.data.data).id;
                    credentials.rememberMe = user.rememberMe || false;
                    UserService.storeCredentials(credentials);
                    $scope.user = {};
                    $location.path('/home/options');
                } else {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: response.data.error
                    }).then(function () {
                        $scope.user.password = '';
                    });
                }
            });
        };
    });

    controllers.controller('HomeCtrl', function ($scope, UserService, $location) {
        var credentials = UserService.loadCredentials();
        if (!credentials) {
            $location.path('/');
            return false;
        }
        if (!credentials.rememberMe) {
            UserService.clearCredentials();
        }

        $scope.logout = function () {
            UserService.clearCredentials();
            $location.path('/');
        };
    });

    controllers.controller('OptionsCtrl', function () {
    });
}());