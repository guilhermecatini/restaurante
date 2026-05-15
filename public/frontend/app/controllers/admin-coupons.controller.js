(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminCouponsController', AdminCouponsController);

    AdminCouponsController.$inject = ['$stateParams', 'AdminService', 'UiFeedbackService'];
    function AdminCouponsController($stateParams, AdminService, UiFeedbackService) {
        var vm = this;

        // ---- List ----------------------------------------------------------
        vm.coupons = [];
        vm.total = 0;
        vm.totalPages = 1;
        vm.loading = false;
        vm.page = parseInt($stateParams.page, 10) || 1;
        vm.limit = 20;

        // ---- Modal ---------------------------------------------------------
        vm.modal = false;
        vm.editMode = false;
        vm.saving = false;
        vm.form = {};

        vm.discountTypes = [
            { value: 'percentage', label: 'Percentual (%)' },
            { value: 'fixed', label: 'Valor fixo (R$)' },
        ];

        // ---- Pagination ----------------------------------------------------
        vm.prevPage = function () { if (vm.page > 1) { vm.page--; loadCoupons(); } };
        vm.nextPage = function () { if (vm.page < vm.totalPages) { vm.page++; loadCoupons(); } };

        // ---- CRUD ----------------------------------------------------------
        vm.openCreate = function () {
            vm.form = {
                code: '', discount_type: 'percentage', value: null,
                min_order_value: null, max_uses: null, valid_until: null, is_active: true,
            };
            vm.editMode = false;
            vm.modal = true;
        };

        vm.openEdit = function (coupon) {
            vm.form = angular.copy(coupon);
            // Format date for input[type=date]
            if (vm.form.valid_until) {
                vm.form.valid_until = vm.form.valid_until.substring(0, 10);
            }
            vm.editMode = true;
            vm.modal = true;
        };

        vm.closeModal = function () { vm.modal = false; vm.saving = false; };

        vm.save = function () {
            if (vm.saving) return;
            vm.saving = true;
            var promise = vm.editMode
                ? AdminService.updateCoupon(vm.form.id, vm.form)
                : AdminService.createCoupon(vm.form);

            promise
                .then(function () {
                    UiFeedbackService.success(vm.editMode ? 'Cupom atualizado!' : 'Cupom criado!');
                    vm.closeModal();
                    loadCoupons();
                })
                .catch(function (err) {
                    var msg = (err && err.data && err.data.message) || 'Erro ao salvar cupom.';
                    UiFeedbackService.error(msg);
                })
                .finally(function () { vm.saving = false; });
        };

        vm.toggleStatus = function (coupon) {
            AdminService.toggleCouponStatus(coupon.id)
                .then(function (updated) { coupon.is_active = updated.is_active; })
                .catch(function () { UiFeedbackService.error('Erro ao atualizar status.'); });
        };

        vm.deleteCoupon = function (coupon) {
            UiFeedbackService.confirm('Excluir cupom "' + coupon.code + '"?', 'Esta ação não pode ser desfeita.')
                .then(function (confirmed) {
                    if (!confirmed) return;
                    AdminService.deleteCoupon(coupon.id)
                        .then(function () { UiFeedbackService.success('Cupom excluído!'); loadCoupons(); })
                        .catch(function () { UiFeedbackService.error('Erro ao excluir cupom.'); });
                });
        };

        // ---- Load ----------------------------------------------------------
        function loadCoupons() {
            vm.loading = true;
            AdminService.getCoupons({ page: vm.page, limit: vm.limit })
                .then(function (res) {
                    vm.coupons = res.data || [];
                    vm.total = res.total || 0;
                    vm.totalPages = res.totalPages || Math.ceil(vm.total / vm.limit) || 1;
                })
                .catch(function () { UiFeedbackService.error('Erro ao carregar cupons.'); })
                .finally(function () { vm.loading = false; });
        }

        loadCoupons();
    }
})();
