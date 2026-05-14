"use strict";

const modules = [
    "$scope",
    "$stateParams",
    "$location",
    "$timeout",
    "AlertFactory",
    "fakeDataService"
];

app.controller("ItemController", [...modules, function ($scope, $stateParams, $location, $timeout, AlertFactory, fakeDataService) {

    const { id } = $stateParams;

    $scope.alterar_quantidade = function (operation) {
        if (operation == "-" && $scope.item.quantidade > 1)
            $scope.item.quantidade--;
        else if (operation == "+")
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
    $scope.item.observacao = "";

    $scope.adicionar_ao_carrinho = function () {
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
