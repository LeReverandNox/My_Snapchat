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
            $location.path('/home/send-snap');
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
                    credentials.email = user.email;
                    credentials.rememberMe = user.rememberMe || false;
                    UserService.storeCredentials(credentials);
                    $scope.user = {};
                    $location.path('/home/send-snap');
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

    controllers.controller('SendSnapCtrl', function ($scope, SnapService, ToolsService, UserService, $ionicPopup) {
        $scope.isSnaping = false;
        $scope.isGoingToChooseUsers = false;
        $scope.isChoosingUsers = false;
        $scope.isSelectingTime = false;
        var snapHolder = document.querySelector('.send-snap-holder');

        this.image = null;
        this.credentials = UserService.loadCredentials();
        this.time = 7;

        var self = this;

        $scope.reset = function () {
            $scope.isSnaping = false;
            $scope.isChoosingUsers = false;
            $scope.isSelectingTime = false;
            ToolsService.removeAllChildren(snapHolder);
            self.image = null;
            $scope.time = 7;
            self.time = 7;
            $scope.users = [];
        };

        $scope.launchCamera = function () {
            SnapService.takePicture(function (data) {
                self.image = data;
                ToolsService.removeAllChildren(snapHolder);
                var img = new Image();
                img.src = data;
                img.className += 'send-snap-img';
                img.onload = function () {
                    snapHolder.appendChild(img);
                    $scope.isSnaping = true;
                    $scope.isGoingToChooseUsers = true;
                    $scope.$apply();
                };
            });
        };

        $scope.chooseUsers = function () {
            $scope.isGoingToChooseUsers = false;
            $scope.isChoosingUsers = true;
            $scope.isSelectingTime = false;
            UserService.getUsers(self.credentials, function success(response) {
                if (response.data.error !== true) {
                    $ionicPopup.alert({
                        title: 'Error !',
                        template: response.data.error
                    }).then(function () {
                        $scope.reset();
                        $scope.logout();
                    });
                } else {
                    var users = [];
                    JSON.parse(response.data.data).forEach(function (id) {
                        users.push({
                            id: id,
                            isChecked: false
                        });
                    });
                    $scope.users = users;
                }
            });
        };

        $scope.selectTime = function () {
            $scope.isGoingToChooseUsers = false;
            $scope.isChoosingUsers = false;
            $scope.isSelectingTime = true;
            $scope.values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            $scope.time = self.time;
        };

        $scope.setTime = function (value) {
            self.time = value;
        };

        $scope.sendSnap = function () {
            var destinataires = $scope.users.filter(function (object) {
                return object.isChecked === true;
            });

            SnapService.sendSnap(self.time, self.credentials, destinataires, self.image, function (data) {
                var response = JSON.parse(data.response);
                if (response.error !== true) {
                    $ionicPopup.alert({
                        title: 'Error !',
                        template: response.error
                    }).then(function () {
                        $scope.reset();
                        $scope.logout();
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Well done !',
                        template: 'Your snap has been shipped!'
                    }).then(function () {
                        $scope.reset();
                    });
                }
            });
        };
    });

            });
        };
    });
}());