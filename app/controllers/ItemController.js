"use strict";

const modules = [
    "$scope",
    "$stateParams",
    "$location",
    "$timeout",
    "$window",
    "AlertFactory",
    "SacolaService",
    "fakeDataService"
];

app.controller("ItemController", [...modules, function ($scope, $stateParams, $location, $timeout, $window, AlertFactory, SacolaService, fakeDataService) {

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

    const get_sacola = function () {
        let sacola = $window.localStorage.getItem("sacola");
        if (sacola)
            return JSON.parse(sacola);
        return {
            loja: "010203",
            itens: []
        };
    }

    const set_sacola = function (sacola) {
        $window.localStorage.setItem("sacola", JSON.stringify(sacola));
    }
    //$window.localStorage.clear();

    /**
     * o carrinho deve conter
     * 
     * 
     */

    const proxima_sequencia = function (sacola) {
        let itens = sacola.itens;
        let sequencia_valida = 1;
        if (itens.length == 0)
            return sequencia_valida;
        for (let i = 0; i < itens.length; i++) {
            if (sequencia_valida == itens[i].sequencia)
                sequencia_valida++;
            else
                break;
        }
        return sequencia_valida;
    }

    $scope.adicionar_ao_carrinho = function (item) {

        let { id, quantidade, observacao } = item;

        SacolaService.adicionar_item(id, quantidade, observacao);

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
