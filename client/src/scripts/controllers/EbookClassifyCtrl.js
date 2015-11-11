app.controller('EbookClassifyCtrl', function($scope, $http) {
    //sign to show or hide the (add button && add form)
    $scope.showAddTopClassifyBtn = true;
    $scope.showAddClassifyBtn = true;

    //some value use for select element
    $scope.item_kinds = item_kinds;
    $scope.item_lang = item_lang;

    //show add top classify form
    $scope.showAddTopClassifyForm = function() {
        $scope.showAddTopClassifyBtn = false;
    };

    $scope.addTopClassify = function(name, lang, kind, desc) {
        $scope.showAddTopClassifyBtn = true;

        $http.post(options.api.base_url+'/topclassifys', JSON.stringify({name:name, lang:lang.value, kind:kind.value, desc:desc}));
    };
});
