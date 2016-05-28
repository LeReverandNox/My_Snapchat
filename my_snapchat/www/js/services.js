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

    services.service('SnapService', function ($http) {
        this.apiUrl = 'http://snapchat.samsung-campus.net/api.php';

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
            var ft = new FileTransfer();

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
            ft.upload(image, encodeURI(this.apiUrl + '?option=image'), successCallback, null, options);
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