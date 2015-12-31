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
