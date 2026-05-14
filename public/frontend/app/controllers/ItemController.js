"use strict";

const modules = [
    "$scope",
    "$stateParams",
    "$location",
    "$timeout",
    "AlertFactory",
    "fakeDataService",
    "SacolaService"
];

app.controller("ItemController", [...modules, function ($scope, $stateParams, $location, $timeout, AlertFactory, fakeDataService, SacolaService) {

    const { id } = $stateParams;

    $scope.alterar_quantidade = function (operation) {
        if (operation == "-" && $scope.item.quantidade > 1)
            $scope.item.quantidade--;
        else if (operation == "+" && $scope.item.quantidade < 99)
            $scope.item.quantidade++;
        $scope.recalcular_total_item();
    }

    $scope.recalcular_total_item = function () {
        const { valor_unitario, quantidade } = $scope.item;
        let valor_total = valor_unitario * quantidade;
        $scope.item.valor_total = valor_total;
        $scope.item.valor_total_formatado = valor_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    $scope.item = fakeDataService.getItemById(id);
    if (!$scope.item || !$scope.item.id) {
        $location.path("/loja");
        return;
    }

    $scope.item.observacao = "";

    $scope.adicionar_ao_carrinho = function () {
        const sacola = SacolaService.adicionar_item($scope.item.id, $scope.item.quantidade, $scope.item.observacao || "");
        if (!sacola) {
            AlertFactory.fire("Erro", "Nao foi possivel adicionar o item.", "error");
            return;
        }

        AlertFactory.fire({
            position: "top-end",
            icon: "success",
            text: "Item adicionado ao carrinho.",
            showDenyButton: false,
            showCancelButton: false,
            showCloseButton: false,
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => { },
            willClose: () => { }
        }).then(result => {
            if (result.dismiss === Swal.DismissReason.timer) {
                $timeout(() => {
                    $location.path("/sacola");
                    $scope.$apply();
                }, 200);
            }
        });
    }




}]);
