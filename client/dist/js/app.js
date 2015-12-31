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
                    $window.sessionStorage.user_id = data.id;
                    $window.sessionStorage.username = username;
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
                delete $window.sessionStorage.user_id;
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
            controller: 'EbookListCtrl',
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
        state('upload', {
            url: '/upload',
            templateUrl: '/partials/upload.base.html'
        }).
        state('upload.cover', {
            url: '/cover/{itemId:[0-9]{1,6}}',
            templateUrl: '/partials/upload.cover.html',
            controller: 'UploadCoverCtrl',
            access: { requireAuthenTication:true }
        }).
        state('upload.pdfPreview', {
            url: '/pdfpreview/{itemId:[0-9]{1,6}}',
            templateUrl: '/partials/upload.pdfpreview.html',
            controller: 'UploadPdfPreviewCtrl',
            access: { requireAuthentication:true }
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
            controller: 'TagViewCtrl',
            access: { requireAuthentication: true }
        });
});

app.run(function($rootScope, $window, AuthenticationService, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if (toState != null && toState.access != null && toState.access.requireAuthentication && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
            $state.go('signin');
        }
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $rootScope.previousState = fromState.name;
        $rootScope.previousState_params = fromParams;
    });
});


app.directive('ngThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function(scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({ width: width, height: height });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}]);

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
    $scope.addTopClassify = function(title, lang, desc) {
        $scope.showAddTopClassifyBtn = true;

        if (desc=== undefined) {
            desc = '';
        }

        $http.post(options.api.base_url+'/top_classifys/item_type/1', JSON.stringify({title:title, lang:lang.id,desc:desc})).
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
    $scope.addClassify = function(title ,top_classify, desc ) {
        $scope.showAddClassifyBtn = true;

        if (desc === undefined) {
            desc = '';
        }

        $http.post(options.api.base_url+'/classifys/item_type/1', JSON.stringify({title:title, top_classify:top_classify.id, desc:desc}));
    };
});

app.controller('EbookCreateCtrl', function($scope, $window, Classify, Tag, Ebook, $state) {
    var vm = $scope.vm = {};

    // assignment
    vm.item_lang = item_lang;

    // sign of error warning
    vm.sign_error = 0;

    //get from server 
    Classify.gets(1).success(function(response) {
        vm.top_classifys = response.top_classifys;
        vm.classifys = response.classifys;
    })

    Tag.gets(1).success(function(response) {
        vm.tags = response.tags;
    });
   

    // initialization
    vm.title_plus = '';
    vm.lang = vm.item_lang[0];
    vm.tag = [];
    vm.publisher = '';
    vm.pub_date = '';
    vm.isbn = '';
    vm.desc = '';
    vm.desc_plus = '';
    vm.orig_price = 0;
    vm.cur_price = 0;
    vm.is_sale = false;

    $scope.$watch('vm.lang', function(newValue, oldValue) {
        vm.content_plus = newValue.id <= 2? {
            about: '维语',
            labelForTitle: '维语书名',
            labelForDesc: '维语简介',
            placeholderForTitle: '此处输入维语书名, 必填',
            placeholderForDesc: '此处输入维语简介'
        } : {
            about: '哈语',
            labelForTitle: '哈语书名',
            labelForDesc: '哈语简介',
            placeholderForTitle: '此处输入哈语书名, 必填',
            placeholderForDesc: '此处输入哈语简介'
        };
    }, true);


    // functions 
    vm.submit = function() {
        var newEbook = {
            'title': vm.title,
            'lang': vm.lang.id,
            'title_plus': vm.title_plus,
            'top_classify': vm.top_classify.id,
            'classify': vm.classify.id,
            'author': vm.author,
            'publisher': vm.publisher,
            'pub_date': Date.parse(vm.pub_date),
            'isbn': vm.isbn,
            'desc': vm.desc,
            'desc_plus': vm.desc_plus,
            'orig_price': vm.orig_price,
            'cur_price': vm.cur_price,
            'is_sale': vm.is_sale,
            'editor': $window.sessionStorage.user_id
        }

        newEbook.tags = [];
        for(var k in vm.tag) {
            newEbook.tags.push(vm.tag[k].id);
        }

        Ebook.create(newEbook).success(function(data) {
            $state.go('upload.cover', { itemId:data.id });
        }).error(function(response) {
            console.log(response);
        });

    }

});

app.controller('EbookListCtrl', function($scope, $state) {
    $scope.go = function() {
        $state.go('upload.pdfPreview', { itemId: 2 });
    }
});

app.controller('HomeCtrl', function($scope) {
    
});

app.controller('NavbarCtrl', function ($scope, AuthenticationService, $location, $window) {
    $scope.username = $window.sessionStorage.username;
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

    $scope.addTag = function(title, lang, desc) {
        $scope.showAddTagBtn = true;

        if (desc === undefined) {
            desc = '';
        }

        Tag.create(lang.id, {title:title, lang:lang.id, desc:desc}).success(function() {
            console.log('ok');
        });
    }
});

app.controller('UploadCoverCtrl', function($scope, $rootScope, FileUploader) {
    var uploader = $scope.uploader = new FileUploader({
        url: options.api.base_url + '/upload/cover/'+$rootScope.$stateParams.itemId,
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item, options) {
            var type = "|" + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) != -1;
        }
    });
    uploader.filters.push({
        name: 'limitNum',
        fn: function(item, options) {
            return this.queue.length < 1;
        }
    });


    $scope.completeUpload = false;

    uploader.onCompleAll = function() {
        $scope.completeUpload = true;
        if ($rootScope.previousState === 'ebook.create') {
            $state.go('upload.pdfPreview', {itemId: $rootScope.$stateParams.itemId});
        }
        $state.go('upload.pdfPreview', {itemId: $rootScope.$stateParams.itemId});
    }

});

app.controller('UploadPdfPreviewCtrl', function($scope, $rootScope, $http, FileUploader) {
    console.log($rootScope);

    var uploader = $scope.uploader = new FileUploader({
        url: options.api.base_url + '/upload/pdfpreview',
        formData: [
            {item_id: $rootScope.$stateParams.itemId}
        ]
    });

    uploader.filters.push({
        name: 'zipFilter',
        fn: function(item, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|zip|'.indexOf(type) != -1;
        }
    });
    uploader.filters.push({
        name: 'limitNum',
        fn: function(item, options) {
            return this.queue.length < 1;
        }
    });

    $scope.completeUpload = false;

    $scope.updateFtpAddress = function() {
        console.log($scope.ftpAddress);
        $http.post(options.api.base_url+'/upload/preview', JSON.stringify({'pre_path':$scope.ftpAddress})).success(function(data) {
            console.log(data);
        }).error(function(data) {
            console.log(data);
        });
    }
});

app.factory('Classify', function ($http) {
    var Classify;

    Classify = {
        gets: function (item_type) {
            return $http.jsonp(options.api.base_url + '/classifys/item_type/' + item_type + '?callback=JSON_CALLBACK');
        },
        create: function () {
            
        }
    }

    return Classify;
})

app.factory('Ebook', function($http) {
    var Ebook;

    Ebook = {
        gets: function() {
            
        },
        create: function(data) {
            return $http.post(options.api.base_url+'/ebooks', JSON.stringify(data));
        }
    }

    return Ebook;
})

app.factory('Tag', function($http) {
    var Tag;

    Tag = {
        gets: function (lang_type) {
            return $http.jsonp(options.api.base_url + '/tags/lang_type/' + lang_type + '?callback=JSON_CALLBACK');
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


/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */
app.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});
