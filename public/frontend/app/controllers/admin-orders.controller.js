(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminOrdersController', AdminOrdersController);

    AdminOrdersController.$inject = ['$stateParams', '$state', 'AdminService', 'UiFeedbackService'];
    function AdminOrdersController($stateParams, $state, AdminService, UiFeedbackService) {
        var vm = this;

        // ---- Filters -------------------------------------------------------
        vm.filters = {
            status: $stateParams.status || '',
            page: parseInt($stateParams.page, 10) || 1,
            limit: 20,
        };

        vm.statusOptions = [
            { value: '', label: 'Todos' },
            { value: 'pending', label: 'Aguardando' },
            { value: 'confirmed', label: 'Confirmado' },
            { value: 'preparing', label: 'Preparando' },
            { value: 'ready', label: 'Pronto' },
            { value: 'out_for_delivery', label: 'Em entrega' },
            { value: 'delivered', label: 'Entregue' },
            { value: 'cancelled', label: 'Cancelado' },
        ];

        var STATUS_NEXT = {
            pending: 'confirmed',
            confirmed: 'preparing',
            preparing: 'ready',
            ready: 'out_for_delivery',
            out_for_delivery: 'delivered',
        };

        var STATUS_LABELS = {
            pending: 'Aguardando',
            confirmed: 'Confirmado',
            preparing: 'Preparando',
            ready: 'Pronto',
            out_for_delivery: 'Em entrega',
            delivered: 'Entregue',
            cancelled: 'Cancelado',
        };

        // ---- State ---------------------------------------------------------
        vm.orders = [];
        vm.total = 0;
        vm.totalPages = 1;
        vm.loading = false;
        vm.selectedOrder = null;
        vm.detailLoading = false;
        vm.updatingStatus = false;

        vm.statusLabel = function (s) { return STATUS_LABELS[s] || s; };
        vm.nextStatus = function (s) { return STATUS_NEXT[s] || null; };

        // ---- Actions -------------------------------------------------------
        vm.filterByStatus = function (status) {
            vm.filters.status = status;
            vm.filters.page = 1;
            loadOrders();
        };

        vm.prevPage = function () {
            if (vm.filters.page <= 1) return;
            vm.filters.page--;
            loadOrders();
        };

        vm.nextPage = function () {
            if (vm.filters.page >= vm.totalPages) return;
            vm.filters.page++;
            loadOrders();
        };

        vm.selectOrder = function (order) {
            if (vm.selectedOrder && vm.selectedOrder.id === order.id) return;
            vm.selectedOrder = order;
            vm.detailLoading = true;
            AdminService.getOrder(order.id)
                .then(function (detail) { vm.selectedOrder = detail; })
                .catch(function () { UiFeedbackService.error('Erro ao carregar pedido.'); })
                .finally(function () { vm.detailLoading = false; });
        };

        vm.advanceStatus = function (order) {
            var next = STATUS_NEXT[order.status];
            if (!next || vm.updatingStatus) return;
            vm.updatingStatus = true;
            AdminService.updateOrderStatus(order.id, next)
                .then(function (updated) {
                    order.status = updated.status || next;
                    if (vm.selectedOrder && vm.selectedOrder.id === order.id) {
                        vm.selectedOrder.status = order.status;
                    }
                    UiFeedbackService.success('Status atualizado!');
                })
                .catch(function () { UiFeedbackService.error('Erro ao atualizar status.'); })
                .finally(function () { vm.updatingStatus = false; });
        };

        vm.cancelOrder = function (order) {
            UiFeedbackService.confirm('Cancelar pedido #' + order.id + '?', 'Esta ação não pode ser desfeita.')
                .then(function (confirmed) {
                    if (!confirmed) return;
                    AdminService.updateOrderStatus(order.id, 'cancelled')
                        .then(function () {
                            order.status = 'cancelled';
                            if (vm.selectedOrder && vm.selectedOrder.id === order.id) {
                                vm.selectedOrder.status = 'cancelled';
                            }
                            UiFeedbackService.success('Pedido cancelado.');
                        })
                        .catch(function () { UiFeedbackService.error('Erro ao cancelar pedido.'); });
                });
        };

        // ---- Helpers -------------------------------------------------------
        function loadOrders() {
            vm.loading = true;
            var params = {
                page: vm.filters.page,
                limit: vm.filters.limit,
            };
            if (vm.filters.status) params.status = vm.filters.status;

            AdminService.getOrders(params)
                .then(function (res) {
                    vm.orders = res.data || [];
                    vm.total = res.total || 0;
                    vm.totalPages = res.totalPages || Math.ceil(vm.total / vm.filters.limit) || 1;
                })
                .catch(function () { UiFeedbackService.error('Erro ao carregar pedidos.'); })
                .finally(function () { vm.loading = false; });
        }

        loadOrders();
    }
})();
