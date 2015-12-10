app.controller('NavbarCtrl', function ($scope, AuthenticationService, $location, $window) {
    $scope.username = $window.sessionStorage.username;
    $scope.isActive = function (route) {
        return route === $location.path().split('/')[1];
    };
});
