app.factory('Classify', function ($http) {
    var Classify;

    Classify = {
        gets: function (item_type) {
            return $http.jsonp(options.api.base_url + '/classifys/item_type/' + item_type + '?callback=JSON_CALLBACK');
        },
        create: function () {
            
        }
    }

    return Classify;
})
