app.controller('EbookCreateCtrl', function($scope, Classify, Tag, $fileUploader) {
    var vm = $scope.vm = {};

    vm.coverUploader  = $fileUploader.create({
        url: options.api.base_url+'/api/upload/cover',
        autoUpload: true,
        filters: [
            function (item) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        ]
    });
    // assignment
    vm.item_lang = item_lang;


    //get from server 
    Classify.gets(1).success(function(response) {
        vm.top_classifys = response.top_classifys;
        vm.classifys = response.classifys;
    })

    Tag.gets(1).success(function(response) {
        vm.tags = response.tags;
    });
    vm.tag = [];

    // initialization
    vm.lang = vm.item_lang[0];

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

});
