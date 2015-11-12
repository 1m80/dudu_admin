app.controller('EbookClassifyCtrl', function($scope, $http) {
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

        $http.post(options.api.base_url+'/topclassifys', JSON.stringify({name:name, lang:lang.id, item_type:1, desc:desc})).
            success(function() {
            }).error(function(data) {
                alert(data.message);
            });
    };

    // show add classify form
    $scope.showAddClassifyForm = function() {
        $scope.showAddClassifyBtn = false;
    };

    // poset new classify data to server
    $scope.addClassify = function(name ,top_classify, desc ) {
        $scope.showAddClassifyBtn = true;
        console.log(name, top_classify.id, desc)
    }
});
