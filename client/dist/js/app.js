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

app.controller('EbookClassifyCtrl', function($scope, $http, $window) {
    // sign to show or hide the (add button && add form)
    $scope.showAddTopClassifyBtn = true;
    $scope.showAddClassifyBtn = true;

    // some value use for select element
    $scope.item_lang = item_lang;

    // show add top classify form
    $scope.showAddTopClassifyForm = function() {
        $scope.showAddTopClassifyBtn = false;
    };

    // post new top_classify data to server
    $scope.addTopClassify = function(name, lang, desc) {
        $scope.showAddTopClassifyBtn = true;

        $http.post(options.api.base_url+'/top_classifys/item_type/1', JSON.stringify({name:name, lang:lang.id,esc:desc})).
            success(function() {
            }).error(function(data) {
                alert(data.message);
            });
    };

    // show add classify form
    $scope.showAddClassifyForm = function() {
        $scope.showAddClassifyBtn = false;

        var myurl = options.api.base_url + '/top_classifys/item_type/1?callback=JSON_CALLBACK';
        $http.jsonp(myurl).success(function(data) {
        });
    };

    // poset new classify data to server
    $scope.addClassify = function(name ,top_classify, desc ) {
        $scope.showAddClassifyBtn = true;
        console.log(name, top_classify.id, desc)
    }
});

app.controller('HomeCtrl', function($scope) {
    
});

app.controller('NavbarCtrl', function ($scope, AuthenticationService, $location) {
    $scope.isActive = function (route) {
        return route === $location.path().split('/')[1];
    };
});

app.factory('TopClassify', function(Restangular) {
    var TopClassify;

    TopClassify = {
        gets: function(type) {
            return '';
        },
        create: function(item_type, data) {
            return '';
        }
    }

    return TopClassify;
})
