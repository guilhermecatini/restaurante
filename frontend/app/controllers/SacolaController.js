
app.controller("SacolaController", function ($scope, $window, fakeDataService, AlertFactory, SacolaService) {

    const { info_loja } = fakeDataService.getFakeData();

    $scope.info_loja = info_loja;

    $scope.finalizar_compra = function () {
        AlertFactory.fire("", "Desenvolver o método que gera o pedido.")
    }

    $scope.recarregar_sacola = function() {
        $scope.sacola = SacolaService.carregar_sacola();
    }

    $scope.recarregar_sacola();

    $scope.remover_item = function (item) {
        AlertFactory.fire({
            html: `<span>Deseja realmente remover o item <strong>${item.sequencia} - ${item.descricao}</strong>?</span>`,
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não"
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                SacolaService.remover_item(item.sequencia);
                $scope.recarregar_sacola();
                $scope.$apply();
            }
        });
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
