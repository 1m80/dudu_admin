app.controller('EbookCreateCtrl', function($scope, $window, Classify, Tag, Ebook, $state) {
    var vm = $scope.vm = {};

    // assignment
    vm.item_lang = item_lang;

    // sign of error warning
    vm.sign_error = 0;

    //get from server 
    Classify.gets(1).success(function(response) {
        vm.top_classifys = response.top_classifys;
        vm.classifys = response.classifys;
    })

    Tag.gets(1).success(function(response) {
        vm.tags = response.tags;
    });
   

    // initialization
    vm.title_plus = '';
    vm.lang = vm.item_lang[0];
    vm.tag = [];
    vm.publisher = '';
    vm.pub_date = '';
    vm.isbn = '';
    vm.desc = '';
    vm.desc_plus = '';
    vm.orig_price = 0;
    vm.cur_price = 0;
    vm.is_sale = false;

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


    // functions 
    vm.submit = function() {
        var newEbook = {
            'title': vm.title,
            'lang': vm.lang.id,
            'title_plus': vm.title_plus,
            'top_classify': vm.top_classify.id,
            'classify': vm.classify.id,
            'author': vm.author,
            'publisher': vm.publisher,
            'pub_date': Date.parse(vm.pub_date),
            'isbn': vm.isbn,
            'desc': vm.desc,
            'desc_plus': vm.desc_plus,
            'orig_price': vm.orig_price,
            'cur_price': vm.cur_price,
            'is_sale': vm.is_sale,
            'editor': $window.sessionStorage.user_id
        }

        newEbook.tags = [];
        for(var k in vm.tag) {
            newEbook.tags.push(vm.tag[k].id);
        }

        Ebook.create(newEbook).success(function(data) {
            $state.go('upload.cover', { itemId:data.id });
        }).error(function(response) {
            console.log(response);
        });

    }

});
