(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminProductsController', AdminProductsController);

    AdminProductsController.$inject = ['$stateParams', 'AdminService', 'UiFeedbackService'];
    function AdminProductsController($stateParams, AdminService, UiFeedbackService) {
        var vm = this;

        // ---- List state ----------------------------------------------------
        vm.products = [];
        vm.categories = [];
        vm.total = 0;
        vm.totalPages = 1;
        vm.loading = false;
        vm.filters = {
            q: $stateParams.q || '',
            categoryId: $stateParams.categoryId || '',
            page: parseInt($stateParams.page, 10) || 1,
            limit: 24,
        };

        // ---- Modal state ---------------------------------------------------
        vm.modal = false;
        vm.editMode = false;
        vm.saving = false;
        vm.form = {};

        // ---- Pagination ----------------------------------------------------
        vm.prevPage = function () { if (vm.filters.page > 1) { vm.filters.page--; loadProducts(); } };
        vm.nextPage = function () { if (vm.filters.page < vm.totalPages) { vm.filters.page++; loadProducts(); } };

        vm.search = function () { vm.filters.page = 1; loadProducts(); };

        vm.filterCategory = function (id) {
            vm.filters.categoryId = id;
            vm.filters.page = 1;
            loadProducts();
        };

        // ---- CRUD ----------------------------------------------------------
        vm.openCreate = function () {
            vm.form = { is_available: true, price: null, category_id: '' };
            vm.editMode = false;
            vm.modal = true;
        };

        vm.openEdit = function (product) {
            vm.form = angular.copy(product);
            vm.editMode = true;
            vm.modal = true;
        };

        vm.closeModal = function () { vm.modal = false; vm.saving = false; };

        vm.save = function () {
            if (vm.saving) return;
            vm.saving = true;
            var promise = vm.editMode
                ? AdminService.updateProduct(vm.form.id, vm.form)
                : AdminService.createProduct(vm.form);

            promise
                .then(function () {
                    UiFeedbackService.success(vm.editMode ? 'Produto atualizado!' : 'Produto criado!');
                    vm.closeModal();
                    loadProducts();
                })
                .catch(function (err) {
                    var msg = (err && err.data && err.data.message) || 'Erro ao salvar produto.';
                    UiFeedbackService.error(msg);
                })
                .finally(function () { vm.saving = false; });
        };

        vm.toggleStatus = function (product) {
            AdminService.toggleProductStatus(product.id)
                .then(function (updated) { product.is_available = updated.is_available; })
                .catch(function () { UiFeedbackService.error('Erro ao atualizar status.'); });
        };

        vm.deleteProduct = function (product) {
            UiFeedbackService.confirm('Excluir "' + product.name + '"?', 'Esta ação não pode ser desfeita.')
                .then(function (confirmed) {
                    if (!confirmed) return;
                    AdminService.deleteProduct(product.id)
                        .then(function () {
                            UiFeedbackService.success('Produto excluído!');
                            loadProducts();
                        })
                        .catch(function () { UiFeedbackService.error('Erro ao excluir produto.'); });
                });
        };

        // ---- Helpers -------------------------------------------------------
        function loadProducts() {
            vm.loading = true;
            var params = { page: vm.filters.page, limit: vm.filters.limit };
            if (vm.filters.q) params.q = vm.filters.q;
            if (vm.filters.categoryId) params.category_id = vm.filters.categoryId;

            AdminService.getProducts(params)
                .then(function (res) {
                    vm.products = res.data || [];
                    vm.total = res.total || 0;
                    vm.totalPages = res.totalPages || Math.ceil(vm.total / vm.filters.limit) || 1;
                })
                .catch(function () { UiFeedbackService.error('Erro ao carregar produtos.'); })
                .finally(function () { vm.loading = false; });
        }

        function loadCategories() {
            AdminService.getCategories()
                .then(function (cats) { vm.categories = cats; })
                .catch(angular.noop);
        }

        loadProducts();
        loadCategories();
    }
})();
