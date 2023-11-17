
app.controller("SacolaController", function ($scope, $window, fakeDataService, AlertFactory, SacolaService) {

    const { info_loja } = fakeDataService.getFakeData();

    $scope.info_loja = info_loja;
    $scope.sacola = SacolaService.carregar_sacola();

    $scope.finalizar_compra = function () {
        AlertFactory.fire("", "Desenvolver o método que gera o pedido.")
    }

    $scope.remover_item = function () {
        AlertFactory.fire("", "Desenvolver o método para remover o item")
    }


    



    

    /*
    $scope.sacola = {
        itens: [
            {
                sequencia_item: 1,
                ...fakeDataService.getItemById("1"),
                observacao: "Remover a batata frita."
            },
            {
                sequencia_item: 2,
                ...fakeDataService.getItemById("3"),
                observacao: ""
            }
        ]
    }
    */

});
