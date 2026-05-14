
app.controller("SacolaController", function ($scope, fakeDataService, AlertFactory, SacolaService) {

    const { info_loja } = fakeDataService.getFakeData();

    $scope.info_loja = info_loja;

    const sincronizarSacola = function () {
        $scope.sacola = SacolaService.carregar_sacola();
    };

    sincronizarSacola();

    $scope.finalizar_compra = function () {
        if (!$scope.sacola.itens.length) {
            AlertFactory.fire("Ops", "Adicione itens na sacola antes de finalizar.", "warning");
            return;
        }

        AlertFactory.fire("Em desenvolvimento", "A finalizacao do pedido sera integrada com a API.", "info");
    };

    $scope.remover_item = function (sequencia_item) {
        SacolaService.remover_item(sequencia_item);
        sincronizarSacola();
    };

});
