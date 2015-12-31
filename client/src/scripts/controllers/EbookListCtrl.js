app.controller('EbookListCtrl', function($scope, $state) {
    $scope.go = function() {
        $state.go('upload.pdfPreview', { itemId: 2 });
    }
});
