app.factory('Tag', function($http) {
    var Tag;

    Tag = {
        gets: function (lang_type) {
            return $http.jsonp(options.api.base_url + '/tags/lang_type/' + lang_type + '?callback=JSON_CALLBACK');
        },
        create: function(lang_type, data) {
            return $http.post(options.api.base_url+'/tags/lang_type/'+lang_type, JSON.stringify(data));
        }
    }

    return Tag;
})
