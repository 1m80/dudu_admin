'use strice';

appControllers.controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',
    function AdminUserCtrl($scope, $location, $window, UserService, AuthenticationService) {
        $scope.logIn = function logIn(username, password) {
            if (username != undefined && password !== undefined) {
                UserService.logIn(username, password).success(function(data) {
                    AuthenticationService.idLogged = true;
                    $window.sessionStorage.token = data.token;
                    $location.path('/');
                }).error(function(status, data) {
                    console.log(statue);
                    console.log(data);
                });
            }
        }

        $scope.logout = function logout() {
            if (AuthenticationService.isLogged) {
                AuthenticationService.liLogged = false;
                delete $window.sessionStorage.token;
                $location.path('/login');
            }
        }
    }
]);

appServices.factory('AuthenticationService', function() {
    var auth = {
        isLogged: false
    }

    return auth;
});
appServices.factory('UserService', function($http) {
    return {
        logIn: function(username, password) {
            return $http.post(options.api.base_url+'/sessions', {username:username, password: password});
        },

        logOut: function() {
            
        }
    };
});

appServices.factory('TokenInterceptor', function ($q, $window, AuthenticationService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },

        response: function (response) {
            return response || $q.when(response);
        }
    };
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.config(['$locationProvider', '$routeProvider', function($location, $routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/home.html',
            controller: 'PostListCtrl',
            access: { requiredLogin: true }

        }).
        when('/login', {
            templateUrl: 'partials/user.login.html',
            controller: 'AdminUserCtrl'
        }).
        when('/logout', {
            templateUrl: 'partials/user.logout.html',
            controller: 'AdminUserCtrl',
            access: { requiredLogin: true }
        })
        otherwist({
            redirectTo: '/login'
        })
}
           ]);

app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin && !AuthenticationService.isLogged && !$window.sessionStorage.token) {
            $location.path('/login');
        }
    });
});
