/*jslint browser this for */
/*global angular alert FileTransfer FileUploadOptions */

(function () {
    'use strict';

    var services = angular.module('my_snapchat.services', []);

    services.service('UserService', function ($http) {
        this.credentials = {};

        this.apiUrl = 'http://snapchat.samsung-campus.net/api.php';

        this.register = function (user, successCallback) {
            $http.post(this.apiUrl + '?option=inscription', user)
                .then(successCallback);
        };

        this.login = function (user, successCallback) {
            $http.post(this.apiUrl + '?option=connexion', user)
                .then(successCallback);
        };

        this.storeCredentials = function (credentials) {
            localStorage.setItem('My_Snapchat_Credentials', JSON.stringify(credentials));
            return true;
        };

        this.loadCredentials = function () {
            this.credentials = JSON.parse(localStorage.getItem('My_Snapchat_Credentials')) || false;
        };

        this.clearCredentials = function () {
            localStorage.removeItem('My_Snapchat_Credentials');
            return true;
        };

        this.getUsers = function (credentials, successCallback) {
            var littleCredentials = {
                email: credentials.email,
                token: credentials.token
            };
            $http.post(this.apiUrl + '?option=toutlemonde', littleCredentials)
                .then(successCallback);
        };
    });

    services.service('SnapService', function ($http, $q) {
        this.apiUrl = 'http://snapchat.samsung-campus.net/api.php';
        this.offline = false;
        this.toSend = [];
        this.isMonitoring = false;

        var self = this;

        this.monitorConnection = function () {
            if (!self.isMonitoring) {
                document.addEventListener("online", function () {
                    if (!self.offline) {
                        return;
                    }
                    self.offline = false;
                    self.sendPending();
                });

                document.addEventListener("offline", function () {
                    self.offline = true;
                });
            }
            self.isMonitoring = true;
        };

        this.sendPending = function () {
            if (self.toSend.length > 0) {
                var promises = [];
                var fileTransfer = new FileTransfer();
                this.toSend.forEach(function (obj) {
                    var prom = $q(function (resolve, reject) {
                        var success = function (data) {

                            var response = JSON.parse(data.response);
                            if (response.error !== true) {
                                reject();
                            } else {
                                resolve();
                            }
                        };
                        fileTransfer.upload(obj.image, obj.url, success, null, obj.options);
                    });
                    promises.push(prom);
                });
                self.toSend = [];

                $q.all(promises).then(function () {
                    console.log("Toutes les promise sont resolves !!!");
                    alert("All your pending Snap's have been send !");
                });
            }
        };

        this.takePicture = function (callback) {
            navigator.camera.getPicture(
                function successCallback(data) {
                    callback(data);
                },
                function errorCallback(message) {
                    console.log(message);
                },
                {
                    quality: 50
                }
            );
        };

        this.sendSnap = function (time, credentials, destinataires, image, successCallback) {
            var fileTransfer = new FileTransfer();

            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = image.substr(image.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            var dests = [];
            destinataires.forEach(function (user) {
                dests.push(user.id);
            });

            options.params = {
                email: credentials.email,
                u2: dests.join(','),
                temps: time,
                token: credentials.token
            };

            if (self.offline) {
                console.log("On est horsligne, on stock les snaps");
                var obj = {
                    image: image,
                    options: options,
                    url: encodeURI(this.apiUrl + '?option=image')
                };
                self.toSend.push(obj);
                successCallback({
                    response: '{"error":"maybe","data":null,"token":null}'
                });
            }

            fileTransfer.upload(image, encodeURI(this.apiUrl + '?option=image'), successCallback, null, options);
        };

        this.getSnaps = function (credentials, successCallback) {
            var littleCredentials = {
                email: credentials.email,
                token: credentials.token
            };
            $http.post(this.apiUrl + '?option=newsnap', littleCredentials)
                .then(successCallback);
        };

        this.markAsViewed = function (credentials, snapId, successCallback) {
            var data = {
                email: credentials.email,
                token: credentials.token,
                id: snapId
            };
            $http.post(this.apiUrl + '?option=vu', data)
                .then(successCallback);
        };
    });

    services.service('ToolsService', function () {
        this.removeAllChildren = function (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        };
    });
}());