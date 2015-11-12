app.controller('EbookClassifyCtrl', function($scope, $http, Restangular) {
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

        $http.post(options.api.base_url+'/topclassifys/item_type/1', JSON.stringify({name:name, lang:lang.id,esc:desc})).
            success(function() {
            }).error(function(data) {
                alert(data.message);
            });
    };

    // show add classify form
    $scope.showAddClassifyForm = function() {
        $scope.showAddClassifyBtn = false;

        //get top_classifys from server

        /*
        $http.get(options.api.base_url+'/top_classifys/item_type/1').success(function(response) {
            $scope.top_classifys = response.top_classifys;
            console.log($scope.top_classifys);
        });
        */
        var top_classifys = Restangular.one('/top_classifys/item_type/1').getList();
        console.log(top_classifys);
    };

    // poset new classify data to server
    $scope.addClassify = function(name ,top_classify, desc ) {
        $scope.showAddClassifyBtn = true;
        console.log(name, top_classify.id, desc)
    }
});
