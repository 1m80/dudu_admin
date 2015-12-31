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
