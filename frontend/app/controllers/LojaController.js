
app.controller("LojaController", function ($scope, $state, fakeDataService) {

    $scope.selecionar_item = function (item) {
        $state.go("item", { id: item.id });
    }

    $scope.send_data = {
        tipo_entrega: "entrega"
    };

    $scope.tipos_de_entrega = [
        {
            value: "entrega",
            label: "Entrega"
        },
        {
            value: "retira",
            label: "Retira"
        }
    ];

    $scope.data = fakeDataService.getFakeData();
   



});
