app.factory('Tag', function($http) {
    var Tag;

    Tag = {
        gets: function () {
            return '';
        },
        create: function(lang_type, data) {
            return $http.post(options.api.base_url+'/tags/lang_type/'+lang_type, JSON.stringify(data));
        }
    }

    return Tag;
})
