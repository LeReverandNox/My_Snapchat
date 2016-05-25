/*jslint browser this for */
/*global angular alert */

(function () {
    'use strict';

    var services = angular.module('my_snapchat.services', []);

    services.service('UserService', function ($http) {
        var self = this;
        this.apiUrl = 'http://snapchat.samsung-campus.net/api.php';

        this.register = function (user, successCallback) {
            $http.post(self.apiUrl + '?option=inscription', user)
                .then(successCallback);
        };

        this.login = function (user, successCallback) {
            $http.post(self.apiUrl + '?option=connexion', user)
                .then(successCallback);
        };

        this.storeCredentials = function (credentials) {
            localStorage.setItem('My_Snapchat_Credentials', JSON.stringify(credentials));
            return true;
        };

        this.loadCredentials = function () {
            return localStorage.getItem('My_Snapchat_Credentials') || false;
        };

        this.clearCredentials = function () {
            localStorage.removeItem('My_Snapchat_Credentials');
        }
    });
}());