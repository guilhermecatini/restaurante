app.controller("controller", controller);

controller.$inject = ["$scope", "$window", "$http"];

function controller($scope, $window, $http) {

    $scope.scripts = [];

    $scope.selectScript = function(dt) {
        $window.location.href = `/cat/nav/ui/classic/scripthelp/${dt.id}`;
    }

    $scope.getScripts = function () {
        $http({
            method: "GET",
            url: "/api/v1/scripthelp"
        }).then(function (res) {
            $scope.scripts = res.data.data;
        });
    }
    $scope.getScripts();

}