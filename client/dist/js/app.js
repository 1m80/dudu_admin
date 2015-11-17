'use strict';

var app =angular.module('app', ['ngRoute', 'formly', 'formlyBootstrap']);

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
        when('/ebooks/create', {
            templateUrl: 'partials/ebook.create.html',
            controller: 'EbookCreateCtrl',
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
            templateUrl:'partials/data.home.html',
            access: { requireAuthentication: true }
        }).
        when('/data/tag', {
            templateUrl: 'partials/data.tag.html',
            controller: 'TagViewCtrl',
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

        if (desc=== undefined) {
            desc = '';
        }

        $http.post(options.api.base_url+'/top_classifys/item_type/1', JSON.stringify({name:name, lang:lang.id,desc:desc})).
            success(function() {
            });
    };
    // show add classify form
    $scope.showAddClassifyForm = function() {
        $scope.showAddClassifyBtn = false;

        var myurl = options.api.base_url + '/top_classifys/item_type/1?callback=JSON_CALLBACK';
        $http.jsonp(myurl).success(function(data) {
            $scope.top_classifys = data.top_classifys;
        });
    };

    // post new classify data to server
    $scope.addClassify = function(name ,top_classify, desc ) {
        $scope.showAddClassifyBtn = true;

        if (desc === undefined) {
            desc = '';
        }

        $http.post(options.api.base_url+'/classifys/item_type/1', JSON.stringify({name:name, top_classify:top_classify.id, desc:desc}));
    };
});

app.controller('EbookCreateCtrl', function($scope ) {
    var vm = this;

    $scope.test = 'asdf';

    // function assignment
    vm.onSubmit = onSubmit;

    //variable assignment
    vm.model = {
        awesome: true
    };
    vm.options = {
        formState: {
            awesomeIsForced: false
        }
    };
    vm.fields = [
        {
            key: 'title',
            type: 'input',
            templateOptions: {
                label: '书名',
                placeholder: '在此填写汉文书名'
            }
        },
        {
            key: 'lang',
            type: 'checkbox',
            templateOptions: {
                label: '语种'
            },
            watcher: {
                listener: function(field, newValue, oldValue, formScope, stopWatching) {
                    if (newValue) {
                        stopWatching();
                        formScope.model.desc = 'adsfasdf';
                        formState.options.formState.awesomeIsForced = true;
                    }
                }
            }
        },
        {
            key: 'title_plus',
            key: 'input',
            templateOptions: {
                label: '书名+'
            },
            expressionProperties: {
                'templateOptions.disabled':'formState.awesomeIsForced',
                'templateOptions.label': function(viewValue, modelValue, scope) {
                    if (scope.formState.awesomeIsForced) {
                        return '维文书名';
                    } else {
                        return '哈文书名';
                    }
                }
            }
        },
        {
            key: 'desc',
            type: 'textarea',
            templateOptions: {
                label: '简介',
                placeholder: '此处输入汉语简介',
                description: '这是description'
            },
            expressionProperties: {
                'templateOptions.focus': 'formState.awesomeIsForced',
                'templateOptions.descriptin': function(viewValue, modelValue, scope) {
                    if (scope.formstate.awesomeIsForced) {
                        return 'its get focus';
                    }
                }
            }
        }
    ];

    function onSubmit() {
        alert(JSON.stringify(vm.model), null, 2);
    }
});

app.controller('HomeCtrl', function($scope) {
    
});

app.controller('NavbarCtrl', function ($scope, AuthenticationService, $location) {
    $scope.isActive = function (route) {
        return route === $location.path().split('/')[1];
    };
});

app.controller('TagViewCtrl', function($scope, $http, Tag) {
    // sign of show/hide the add button/form
    $scope.showAddTagBtn = true;

    // some value use for select element
    $scope.item_lang = item_lang;

    // show add Tag form
    $scope.showAddTagForm = function() {
        $scope.showAddTagBtn = false;
    };

    $scope.addTag = function(name, lang, desc) {
        $scope.showAddTagBtn = true;

        if (desc === undefined) {
            desc = '';
        }

        Tag.create(lang.id, {name:name, lang:lang.id, desc:desc}).success(function() {
            console.log('ok');
        });
    }
});

app.factory('Tag', function($http) {
    var Tag;

    Tag = {
        gets: function () {
            return '';
        },
        create: function(lang_type, data) {
            return $http.post(options.api.base_url+'/tags/lang_type/'+lang_type, JSON.stringify(data));
        }
    }

    return Tag;
})

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
