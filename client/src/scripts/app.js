'use strict';

var app =angular.module('app', ['ui.router', 'ngSanitize', 'ui.select', 'angular.filter', 'ui.tinymce', 'ui.date', 'angularFileUpload']);

var options = {};
options.api = {};
options.api.base_url = 'http://127.0.0.1:5000/api';

//item kind 
var item_types = [
    {
        title: '电子书',
        id: 1
    }, {
        title: '有声读物',
        id: 2
    }, {
        title: '视频',
        id: 3
    }, {
        title: '音乐',
        id: 4
    }, {
        title: '图片',
        id: 5
    }
];

//item lang
var item_lang = [
    {
        title: '汉语',
        id: 1
    }, {
        title: '维语',
        id: 2
    }, {
        title: '哈语',
        id: 3
    }
];

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.controller('AppCtrl', ['$scope', '$state', '$window', 'UserService', 'AuthenticationService',
    function AppCtrl($scope, $state, $window, UserService, AuthenticationService) {
        $scope.signIn = function signIn(username, password) {
            if (username != undefined && password !== undefined) {
                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $scope.username = data.username;
                    console.log('sign in success');
                    $state.go('home');
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.signOut = function signOut() {
            console.log('sign out');
            if (AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = false;
                delete $window.sessionStorage.token;
            }
            $state.go('signin');
        }
    }
]);

app.factory('AuthenticationService', function() {
    var auth = {
        isAuthenticated: false
    }

    return auth;
});

app.factory('UserService', function($http) {
    return {
        signIn: function(username, password) {
            return $http.post(options.api.base_url+'/sessions', JSON.stringify({username:username, password: password}));
        }
    };
});

app.factory('TokenInterceptor', function ($q, $window, AuthenticationService, $location) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Basic ' + $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function (rejection) {
            return $q.reject(rejection);
        },

        response: function (response) {
            if (response !=null  && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }

            return response || $q.when(response);
        },

        responseError: function (rejection) {
            if (rejection != null && rejection === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;
                $location.path('/signin');
            }

            return $q.reject(rejection);
        }
    };
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.
        when('/index', '/').
        otherwise('/');

    $stateProvider.
        state('home', {
            url: '/',
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl',
            access: { requireAuthentication: true }
        }).
        state('signin', {
            url: '/signin',
            templateUrl: 'partials/user.signin.html'
        }).
        state('ebook', {
            url: '/ebooks',
            templateUrl: 'partials/ebook.base.html',
            access: { requireAuthentication: true }
        }).
        state('ebook.list', {
            url: '/list',
            templateUrl: 'partials/ebook.list.html',
            access: { requireAuthentication: true }
        }).
        state('ebook.classify', {
            url: '/classifys',
            templateUrl: 'partials/ebook.classify.html',
            controller: 'EbookClassifyCtrl',
            access: { requireAuthentication: true }
        }).
        state('ebook.create', {
            url: '/create',
            templateUrl: 'partials/ebook.create.html',
            controller: 'EbookCreateCtrl',
            access: { requireAuthentication: true }
        }).
        state('ebook.upload.cover', {
            url: '/upload/cover',
            templateUrl: '/partials/ebook.cover.html',
            controller: 'EbookCoverCtrl',
            access: { requireAuthenTication:true }
        }).
        state('data', {
            url: '/data',
            templateUrl: 'partials/data.base.html',
            access: { requireAuthentication: true }
        }).
        state('data.home', {
            url: '/home',
            templateUrl: 'partials/data.home.html',
            access: { requireAuthentication: true }
        }).
        state('data.tag', {
            url: '/tags',
            templateUrl: 'partials/data.tag.html',
            access: { requireAuthentication: true }
        });
});

app.run(function($rootScope, $window, AuthenticationService, $state) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if (toState != null && toState.access != null && toState.access.requireAuthentication && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
            $state.go('signin');
        }
    });
});
