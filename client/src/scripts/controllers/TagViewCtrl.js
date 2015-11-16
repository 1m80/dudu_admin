app.controller('TagViewCtrl', function($scope, $http) {
    // sign of show/hide the add button/form
    $scope.showAddTagBtn = true;

    // some value use for select element
    $scope.item_lang = item_lang;

    // show add Tag form
    $scope.showAddTagForm = function() {
        $scope.showAddTagBtn = false;
    }

    $scope.addTag = function(name, lang, desc) {
        $scope.showAddTagBtn = true;

        if (desc === undefined) {
            desc = '';
        }

        $http.post(options.api.base_url+'/tags/lang_type/'+lang.id, JSON.stringify({name:name, lang:lang.id, desc:desc}));
    }
});
