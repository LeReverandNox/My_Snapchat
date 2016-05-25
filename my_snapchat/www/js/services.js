/*jslint browser this for */
/*global angular alert */

(function () {
    'use strict';

    var services = angular.module('my_snapchat.services', []);

    services.service('UserService', function ($http) {
        var self = this;
        this.apiUrl = 'http://snapchat.samsung-campus.net/api.php?option=inscription';

        this.register = function (user, successCallback) {
            $http.post(self.apiUrl, user)
                .then(successCallback);
        };

    });
}());