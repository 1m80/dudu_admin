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
