(function () {
    'use strict';

    angular.module('deliveryApp.customer').controller('OrdersController', OrdersController);

    OrdersController.$inject = ['OrderService', 'UiFeedbackService'];
    function OrdersController(OrderService, UiFeedbackService) {
        var vm = this;

        vm.loading = true;
        vm.orders = [];
        vm.selectedOrder = null;
        vm.selectedTrack = null;

        vm.refresh = refresh;
        vm.openDetails = openDetails;
        vm.refreshTrack = refreshTrack;
        vm.canCancel = canCancel;
        vm.cancelOrder = cancelOrder;
        vm.statusLabel = statusLabel;
        vm.statusClass = statusClass;
        vm.statusHint = statusHint;

        function refresh() {
            vm.loading = true;
            vm.selectedOrder = null;
            vm.selectedTrack = null;

            OrderService.list({ page: 1, per_page: 20 })
                .then(function (res) {
                    vm.orders = (res && res.data) || [];
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function openDetails(order) {
            if (!order || !order.id) return;

            vm.loading = true;
            vm.selectedOrder = null;
            vm.selectedTrack = null;

            OrderService.get(order.id)
                .then(function (details) {
                    vm.selectedOrder = details;
                    return OrderService.track(order.id);
                })
                .then(function (track) {
                    vm.selectedTrack = track;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function refreshTrack() {
            if (!vm.selectedOrder || !vm.selectedOrder.id) return;
            OrderService.track(vm.selectedOrder.id).then(function (track) {
                vm.selectedTrack = track;
            });
        }

        function canCancel(order) {
            var status = (order && (order.status || (vm.selectedTrack && vm.selectedTrack.status))) || '';
            return status === 'placed' || status === 'confirmed';
        }

        function cancelOrder(order) {
            var target = order || vm.selectedOrder;
            if (!target || !target.id) return;

            if (!canCancel(target)) {
                UiFeedbackService.info('Este pedido nao pode mais ser cancelado.');
                return;
            }

            OrderService.cancel(target.id)
                .then(function (res) {
                    UiFeedbackService.success((res && res.message) || 'Pedido cancelado com sucesso.');
                    refresh();
                });
        }

        function statusLabel(status) {
            var map = {
                placed: 'Aguardando aceite',
                confirmed: 'Pedido aceito',
                preparing: 'Em preparo',
                ready_for_pickup: 'Pronto para retirada',
                out_for_delivery: 'Saiu para entrega',
                delivered: 'Entregue',
                canceled: 'Cancelado',
            };
            return map[status] || status || 'Indefinido';
        }

        function statusClass(status) {
            var map = {
                placed: 'text-bg-secondary',
                confirmed: 'text-bg-primary',
                preparing: 'text-bg-info',
                ready_for_pickup: 'text-bg-warning',
                out_for_delivery: 'text-bg-primary',
                delivered: 'text-bg-success',
                canceled: 'text-bg-danger',
            };
            return map[status] || 'text-bg-secondary';
        }

        function statusHint(status) {
            var map = {
                placed: 'Aguardando aceite do restaurante.',
                confirmed: 'Pedido aceito e aguardando inicio do preparo.',
                preparing: 'A cozinha ja esta preparando seu pedido.',
                ready_for_pickup: 'Pedido pronto para retirada no local.',
                out_for_delivery: 'Pedido em rota de entrega.',
                delivered: 'Pedido entregue com sucesso.',
                canceled: 'Pedido cancelado.',
            };
            return map[status] || 'Status atualizado.';
        }

        refresh();
    }
})();
