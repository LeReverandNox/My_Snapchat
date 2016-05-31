/*jslint browser this for */
/*global angular alert FileTransfer FileUploadOptions $ */

(function () {
    'use strict';

    var services = angular.module('my_snapchat.services', []);

    services.service('UserService', function ($http) {
        this.credentials = {};
        this.users = false;

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

        this.storeUsers = function (users) {
            localStorage.setItem('My_Snapchat_Users', JSON.stringify(users));
            this.users = users;
        };

        this.loadUsers = function () {
            this.users = JSON.parse(localStorage.getItem('My_Snapchat_Users')) || false;
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
                u2: dests.join(';'),
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

    services.service('KonamiService', function (MiniGameService) {
        this.konamiCode = ["U", "U", "D", "D", "L", "R", "L", "R", "B", "A"];
        this.onGoingCode = [];
        this.enabled = false;
        this.BA = false;
        this.loginButton = document.querySelector(".login");
        this.registerButton = document.querySelector(".register");
        this.indexBoo = document.querySelector('.index-boo');
        this.indexBooJ = $('.index-boo');
        var self = this;

        this.build = function (direction) {
            this.onGoingCode.push(direction);
            this.rotateBoo(direction);
            this.verifKonamiCode();
        };

        this.rotateBoo = function (dir) {
            this.resetBoo();

            switch (dir) {
            case 'U':
                this.indexBooJ.addClass('boo-up');
                break;
            case 'D':
                this.indexBooJ.addClass('boo-down');
                break;
            case 'L':
                this.indexBooJ.addClass('boo-left');
                break;
            case 'R':
                this.indexBooJ.addClass('boo-right');
                break;
            case 'B':
                this.indexBooJ.addClass('boo-b');
                break;
            case 'A':
                this.indexBooJ.addClass('boo-a');
                break;
            }
        };

        this.resetBoo = function () {
            var classes = [
                'boo-up',
                'boo-down',
                'boo-left',
                'boo-right',
                'boo-b',
                'boo-a'
            ];

            classes.forEach(function (booClass) {
                self.indexBooJ.removeClass(booClass);
            });
        };

        this.resetCode = function () {
            this.onGoingCode = [];
            this.BA = false;
            this.loginButton.innerHTML = "Login";
            this.registerButton.innerHTML = "Register";
        };

        this.verifKonamiCode = function () {
            if (this.konamiCode[this.onGoingCode.length - 1] === undefined || this.onGoingCode[this.onGoingCode.length - 1] !== this.konamiCode[this.onGoingCode.length - 1]) {
                this.resetCode();
            }

            if (this.onGoingCode.length === 8) {
                this.BA = true;
                this.loginButton.innerHTML = "B";
                this.registerButton.innerHTML = "A";
            }

            if (this.onGoingCode.length === 10) {
                this.resetCode();
                this.disenableKonami();
            }
        };

        this.disenableKonami = function () {
            if (this.enabled) {
                this.disableKonami();
            } else {
                this.enableKonami();
            }
        };

        this.disableKonami = function () {
            this.enabled = false;
            MiniGameService.stop();
            this.resetCode();
        };

        this.enableKonami = function () {
            this.enabled = true;
            MiniGameService.init();
            this.registerButton.innerHTML = "Reset";
        };
    });

    services.service('MiniGameService', function () {
        this.enabled = false;
        this.boo = document.querySelector('.index-boo');
        this.booJ = $('.index-boo');
        this.holder = $('.index-back');
        this.booWidth = 0;
        this.booHeight = 0;
        this.score = 1;
        this.nyancats = [];
        this.isLoosed = false;
        this.perdu = $('<div class="perdu">You loose !</div>');

        var self = this;

        this.init = function () {
            console.log('On lance le minijeu');
            this.prepareBoo();

            function begin() {
                self.spawnNyanCats(5);
                self.launchTimer();
                self.watchColisions();
                self.enabled = true;
            }
            setTimeout(begin, 2000);
        };

        this.prepareBoo = function () {
            this.booJ.addClass('boo-prepared');
            this.booWidth = this.booJ.width();
            this.booHeight = this.booJ.height();
        };

        this.moveBoo = function (event) {
            if (this.enabled) {
                var x = event.gesture.center.pageX - (this.booWidth / 2);
                var y = event.gesture.center.pageY - (this.booHeight / 2);
                this.booJ.css({
                    position: 'absolute',
                    left: x + 'px',
                    top: y + 'px'
                });
            }
        };
        this.stop = function () {
            this.enabled = false;
            this.booJ.removeClass('boo-prepared');
            this.booJ.css({
                position: 'relative',
                left: 0 + 'px',
                top: 0 + 'px'
            });
            this.deleteAllCats();
            this.stopTimer();
            this.deleteTimer();
            this.perdu.remove();
            this.isLoosed = false;
            console.log('On arrete le minijeu');
        };

        this.spawnNyanCats = function (nb) {
            var i = 0;
            var div;
            for (i = 0; i < nb; i += 1) {
                div = $('<div></div>');
                div.addClass('nyancats');
                div.appendTo(this.holder);
                this.nyancats.push(div);
                this.animateSprite(div);
            }
        };

        this.deleteAllCats = function () {
            var cats = $('.nyancats');
            cats.remove();
        };

        this.animateSprite = function (sprite) {
            var newPos = this.findNextPos();
            var oldPos = sprite.offset();
            var speed = this.computeSpeed([oldPos.top, oldPos.left], newPos);

            if (!this.isLoosed) {
                sprite.animate({
                    top: newPos[0],
                    left: newPos[1]
                }, speed, function () {
                    self.animateSprite(sprite);
                });
            }
        };

        this.findNextPos = function () {
            var h = this.holder.height() - 50;
            var w = this.holder.width() - 82;

            var x = Math.floor(Math.random() * h);
            var y = Math.floor(Math.random() * w);

            return [x, y];
        };

        this.computeSpeed = function (previous, next) {
            var x = Math.abs(previous[1] - next[1]);
            var y = Math.abs(previous[0] - next[0]);

            var greatest = x > y
                ? x
                : y;

            var coef = 0.1;

            var speed = Math.ceil(greatest / coef);

            return speed;
        };

        this.launchTimer = function () {
            var clock = $('<div><div>');
            clock.html(self.score);
            clock.addClass('clock');
            clock.appendTo(this.holder);

            this.timer = setInterval(function () {
                self.score += 1;
                clock.html(self.score);
            }, 1000);
        };

        this.stopTimer = function () {
            clearInterval(this.timer);
        };

        this.deleteTimer = function () {
            this.score = 1;
            $('.clock').remove();
        };

        this.checkColision = function (cat) {
            function getPositions(elem) {
                var pos = elem.position();
                var width = elem.width() / 2;
                var height = elem.height();
                return [[pos.left, pos.left + width], [pos.top, pos.top + height]];
            }

            function comparePositions(p1, p2) {
                var r1 = p1[0] < p2[0]
                    ? p1
                    : p2;
                var r2 = p1[0] < p2[0]
                    ? p2
                    : p1;
                return r1[1] > r2[0] || r1[0] === r2[0];
            }

            var pos1 = getPositions(this.booJ);
            var pos2 = getPositions(cat);
            return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
        };

        this.watchColisions = function () {
            this.loop = setInterval(function () {
                if (!self.isLoosed) {
                    var i = 0;
                    for (i = 0; i < self.nyancats.length; i += 1) {
                        self.isLoosed = self.checkColision(self.nyancats[i]);

                    }
                } else {
                    self.loose();
                }
            }, 50);
        };

        this.loose = function () {
            clearInterval(this.loop);
            this.stopTimer();
            this.perdu.appendTo(this.holder);
        };
    });
}());