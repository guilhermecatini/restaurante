app.controller("controllermenu", controllermenu);

controllermenu.$inject = ["$scope", "$window", "$http"];

function controllermenu($scope, $window, $http) {
    $scope.logout = function () {
        $http({
            method: "GET",
            url: "/auth/logout"
        }).then(function (res) {
            $window.location.href = "/cat/nav/ui/classic/login";
        });
    }
}