'use strict';

var app =angular.module('app', ['ngRoute']);

var options = {};
options.api = {};
options.api.base_url = 'http://127.0.0.1:5000/api';

//item kind 
var item_types = [
    {
        name: '电子书',
        id: 1
    }, {
        name: '有声读物',
        id: 2
    }, {
        name: '视频',
        id: 3
    }, {
        name: '音乐',
        id: 4
    }, {
        name: '图片',
        id: 5
    }
];

//item lang
var item_lang = [
    {
        name: '汉语',
        id: 1
    }, {
        name: '维语',
        id: 2
    }, {
        name: '哈语',
        id: 3
    }
];

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.controller('AppCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',
    function AppCtrl($scope, $location, $window, UserService, AuthenticationService) {
        $scope.signIn = function signIn(username, password) {
            if (username != undefined && password !== undefined) {
                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $scope.username = data.username;
                    $location.path('/');
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.signOut = function signOut() {
            if (AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = false;
                delete $window.sessionStorage.token;
                console.log('signout');
                $location.path('/signin');
            }
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

app.factory('TokenInterceptor', function ($q, $window, AuthenticationService) {
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

app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl',
            access: { requireAuthentication: true }
        }).
        when('/ebooks', {
            templateUrl: 'partials/ebook.list.html',
            access: { requireAuthentication: true }
        }).
          when('/ebooks/classifys', {
              templateUrl: 'partials/ebook.classify.html',
              controller: 'EbookClassifyCtrl',
              access: { requireAuthentication: true }
        }).
        when('/ebooks/:id', {
            templateUrl: 'partials/ebook.view.html',
            controller: 'EbookViewCtrl',
            access: { requireAuthentication: true }
        }).
        when('/data', {
            tempalteUrl:'partials/data.home.html',
            access: { requireAuthentication: true }
        }).
          when('/data/tag', {
              templateUrl: 'partials/data.tag.html',
              controller: 'TagViewCtrl',
              access: { requireAuthentication: true }
          })
        when('/signin', {
            templateUrl: 'partials/user.signin.html'
        }).
        otherwise({
            redirectTo: '/'
        });

    $location.html5Mode(true);
}]);


app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requireAuthentication && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
            $location.path('/signin');
        }
    });
});
