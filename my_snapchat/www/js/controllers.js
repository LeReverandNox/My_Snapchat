/*jslint browser this for */
/*global angular alert */

(function () {
    'use strict';

    var controllers = angular.module('my_snapchat.controllers', []);

    controllers.controller('AppCtrl', function () {
        // console.log("App");
    });

    controllers.controller('IndexCtrl', function (UserService, $location) {
        UserService.loadCredentials();
        if (UserService.credentials) {
            $location.path('/home/send-snap');
            return true;
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
        UserService.loadCredentials();
        if (!UserService.credentials) {
            $location.path('/');
            return false;
        }
        if (!UserService.credentials.rememberMe) {
            UserService.clearCredentials();
        }
        $scope.logout = function () {
            UserService.clearCredentials();
            $location.path('/');
            return true;
        };
    });

    controllers.controller('OptionsCtrl', function () {
        console.log('Options');
    });

    controllers.controller('SendSnapCtrl', function ($scope, SnapService, ToolsService, UserService, $ionicPopup) {
        $scope.isSnaping = false;
        $scope.isGoingToChooseUsers = false;
        $scope.isChoosingUsers = false;
        $scope.isSelectingTime = false;
        var snapHolder = document.querySelector('.send-snap-holder');

        this.image = null;
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
            UserService.getUsers(UserService.credentials, function success(response) {
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
                    // DEBUG
                    users.push({
                        id: 106,
                        isChecked: false
                    });
                    //
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

            SnapService.sendSnap(self.time, UserService.credentials, destinataires, self.image, function (data) {
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

    controllers.controller('GetSnapsCtrl', function ($scope, SnapService, ToolsService, UserService, $ionicPopup) {
        this.snaps = [];
        $scope.snaps = [];
        $scope.isListingSnaps = false;
        $scope.isViewingSnap = false;
        var self = this;
        var snapHolder = document.querySelector('.get-snap-holder');

        $scope.init = function () {
            $scope.isViewingSnap = false;
            self.snaps = [];
            ToolsService.removeAllChildren(snapHolder);

            SnapService.getSnaps(UserService.credentials, function (response) {
                // console.log(response);
                if (response.data.error !== true) {
                    $ionicPopup.alert({
                        title: 'Error !',
                        template: response.error
                    }).then(function () {
                        $scope.logout();
                    });
                } else {
                    JSON.parse(response.data.data).forEach(function (snap) {
                        self.snaps.push(snap);
                    });
                    $scope.snaps = self.snaps;
                    console.log(self.snaps);
                    $scope.isListingSnaps = true;
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        };

        var markAsViewed = function (id) {
            SnapService.markAsViewed(UserService.credentials, id, function (response) {
                if (response.data.error !== true) {
                    $ionicPopup.alert({
                        title: 'Error !',
                        template: response.error
                    });
                } else {
                    $scope.init();
                }
            });
        };

        $scope.viewSnap = function (snap) {
            $scope.isListingSnaps = false;
            $scope.isViewingSnap = true;
            console.log(snap);

            var img = new Image();
            img.src = snap.url;
            img.className += 'get-snap-img';
            img.onload = function () {
                snapHolder.appendChild(img);
                setTimeout(function () {
                    markAsViewed(snap.id_snap);
                }, (snap.duration * 1000));
            };
        };

        $scope.init();
    });

}());