app.factory('Ebook', function($http) {
    var Ebook;

    Ebook = {
        gets: function() {
            
        },
        create: function(data) {
            return $http.post(options.api.base_url+'/ebooks', JSON.stringify(data));
        }
    }

    return Ebook;
})
