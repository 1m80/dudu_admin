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
