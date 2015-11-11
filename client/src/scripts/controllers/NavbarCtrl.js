app.controller('NavbarCtrl', function ($scope, AuthenticationService, $location) {
    $scope.isActive = function (route) {
        return route === $location.path().split('/')[1];
    };
    $scope.username = $scope.parent.username;
});
