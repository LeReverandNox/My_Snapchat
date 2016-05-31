/*jslint browser this for */
/*global angular alert */

(function () {
    'use strict';

    var controllers = angular.module('my_snapchat.controllers', []);

    controllers.controller('IndexCtrl', function (UserService, $location, $scope, KonamiService, MiniGameService) {
        UserService.loadCredentials();
        if (UserService.credentials) {
            $location.path('/home/send-snap');
            return true;
        }

        $scope.konaSwipe = function (direction) {
            KonamiService.build(direction);
        };
        $scope.onDrag = function (event) {
            MiniGameService.moveBoo(event);
        };

        $scope.login = function () {
            if (!KonamiService.BA) {
                $location.path('/login');
            } else {
                KonamiService.build('B');
            }
        };

        $scope.register = function () {
            if (!KonamiService.BA) {
                $location.path('/register');
            } else {
                KonamiService.build('A');
            }
        };
    });

    controllers.controller('RegiLogCtrl', function ($scope, UserService, $ionicPopup, $location) {
        $scope.user = {};

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
                    $location.path('/');
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

        $scope.register = function (user) {
            UserService.register(user, function (response) {
                if (response.data.error === true) {
                    $ionicPopup.alert({
                        title: 'Hurray !',
                        template: 'You\'re now registered on My_Snapchat !'
                    }).then(function () {
                        $scope.login(user);
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
    });

    controllers.controller('HomeCtrl', function ($scope, UserService, $location, $ionicHistory, SnapService) {
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

        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        SnapService.monitorConnection();
        UserService.loadUsers();
    });

    controllers.controller('OptionsCtrl', function () {
        console.log('Options');
    });

    controllers.controller('SendSnapCtrl', function ($scope, SnapService, ToolsService, UserService, $ionicPopup, $ionicLoading, $ionicScrollDelegate) {

        $scope.isSnaping = false;
        $scope.isGoingToChooseUsers = false;
        $scope.isChoosingUsers = false;
        $scope.isSelectingTime = false;
        var snapHolder = document.querySelector('.send-snap-holder');

        this.image = null;
        this.time = 7;
        this.destinataires = [];

        var self = this;

        $scope.reset = function () {
            $scope.isSnaping = false;
            $scope.isChoosingUsers = false;
            $scope.isSelectingTime = false;
            $scope.isGoingToChooseUsers = false;

            ToolsService.removeAllChildren(snapHolder);
            self.image = null;
            $scope.time = 7;
            self.time = 7;
            $scope.users = [];
            self.destinataires = [];
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

            if (SnapService.offline === true && UserService.users !== false) {
                $scope.users = UserService.users;
            } else if (SnapService.offline === true) {
                $ionicPopup.alert({
                    title: 'You\'re offline !',
                    template: "Can't fetch the users list..."
                }).then(function () {
                    $scope.reset();
                });
            } else {
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
                        UserService.storeUsers(users);
                        $scope.users = users;
                    }
                });
            }
        };

        $scope.verifyUsers = function () {
            self.destinataires = $scope.users.filter(function (object) {
                return object.isChecked === true;
            });
            if (self.destinataires.length === 0) {
                $ionicPopup.alert({
                    title: 'Error !',
                    template: 'Please choose at least one peep'
                }).then(function () {
                    $scope.chooseUsers();
                });
            } else {
                $scope.selectTime();
            }
        };

        $scope.selectTime = function () {
            $scope.users = [];
            $ionicScrollDelegate.scrollTop();

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
            $ionicLoading.show({
                template: 'Sending...'
            });

            SnapService.sendSnap(self.time, UserService.credentials, self.destinataires, self.image, function (data) {
                var response = JSON.parse(data.response);
                if (response.error === true) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Well done !',
                        template: 'Your snap has been shipped!'
                    }).then(function () {
                        $scope.reset();
                    });
                } else if (response.error === "maybe") {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Pending...',
                        template: 'You\'re are currently offline, your snap will be sent soon !'
                    }).then(function () {
                        $scope.reset();
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Error !',
                        template: response.error
                    }).then(function () {
                        $ionicLoading.hide();
                        $scope.reset();
                        $scope.logout();
                    });
                }
            });
        };
    });

    controllers.controller('GetSnapsCtrl', function ($scope, SnapService, ToolsService, UserService, $ionicPopup, $interval, $ionicLoading) {
        this.snaps = [];
        $scope.snaps = [];
        $scope.isListingSnaps = false;
        $scope.isViewingSnap = false;
        $scope.remaining = 0;
        var self = this;
        var snapHolder = document.querySelector('.get-snap-holder');

        $scope.init = function () {
            $scope.isViewingSnap = false;
            self.snaps = [];
            ToolsService.removeAllChildren(snapHolder);

            if (SnapService.offline) {
                $ionicPopup.alert({
                    title: 'You\'re offline !',
                    template: 'Can\'t fetch your snap\'s...'
                }).then(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            } else {
                SnapService.getSnaps(UserService.credentials, function (response) {
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
                        $scope.isListingSnaps = true;
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                });
            }
        };

        $scope.markAsViewed = function (id) {
            clearTimeout(self.timeout);
            $interval.cancel(self.itv);

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
            if (SnapService.offline) {
                $ionicPopup.alert({
                    title: 'You\'re offline !',
                    template: 'Can\'t see that snap\' for now !'
                });
                return false;
            }

            $scope.isListingSnaps = false;
            var duration = snap.duration * 1000;
            $scope.remaining = snap.duration;

            $ionicLoading.show({
                template: 'Loading...'
            });

            var img = new Image();
            img.src = snap.url;
            img.className += 'get-snap-img';
            img.onload = function () {
                $scope.isViewingSnap = true;
                $scope.snap = snap;
                $ionicLoading.hide();
                snapHolder.appendChild(img);
                self.itv = $interval(function () {
                    $scope.remaining -= 1;
                }, 1000);
                self.timeout = setTimeout(function () {
                    $scope.markAsViewed(snap.id_snap);
                }, (duration));
            };
        };

        $scope.init();
    });

}());