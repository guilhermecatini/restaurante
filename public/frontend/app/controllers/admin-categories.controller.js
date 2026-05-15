(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminCategoriesController', AdminCategoriesController);

    AdminCategoriesController.$inject = ['AdminService', 'UiFeedbackService'];
    function AdminCategoriesController(AdminService, UiFeedbackService) {
        var vm = this;

        vm.categories = [];
        vm.loading = false;
        vm.modal = false;
        vm.editMode = false;
        vm.saving = false;
        vm.form = {};

        // ---- CRUD ----------------------------------------------------------
        vm.openCreate = function () {
            vm.form = { name: '', description: '', is_active: true };
            vm.editMode = false;
            vm.modal = true;
        };

        vm.openEdit = function (cat) {
            vm.form = angular.copy(cat);
            vm.editMode = true;
            vm.modal = true;
        };

        vm.closeModal = function () { vm.modal = false; vm.saving = false; };

        vm.save = function () {
            if (vm.saving) return;
            vm.saving = true;
            var promise = vm.editMode
                ? AdminService.updateCategory(vm.form.id, vm.form)
                : AdminService.createCategory(vm.form);

            promise
                .then(function () {
                    UiFeedbackService.success(vm.editMode ? 'Categoria atualizada!' : 'Categoria criada!');
                    vm.closeModal();
                    loadCategories();
                })
                .catch(function (err) {
                    var msg = (err && err.data && err.data.message) || 'Erro ao salvar categoria.';
                    UiFeedbackService.error(msg);
                })
                .finally(function () { vm.saving = false; });
        };

        vm.deleteCategory = function (cat) {
            UiFeedbackService.confirm('Excluir categoria "' + cat.name + '"?', 'Os produtos desta categoria não serão excluídos.')
                .then(function (confirmed) {
                    if (!confirmed) return;
                    AdminService.deleteCategory(cat.id)
                        .then(function () {
                            UiFeedbackService.success('Categoria excluída!');
                            loadCategories();
                        })
                        .catch(function (err) {
                            var msg = (err && err.data && err.data.message) || 'Erro ao excluir categoria.';
                            UiFeedbackService.error(msg);
                        });
                });
        };

        // ---- Reorder -------------------------------------------------------
        vm.moveUp = function (idx) {
            if (idx === 0) return;
            var tmp = vm.categories[idx - 1];
            vm.categories[idx - 1] = vm.categories[idx];
            vm.categories[idx] = tmp;
            _saveOrder();
        };

        vm.moveDown = function (idx) {
            if (idx >= vm.categories.length - 1) return;
            var tmp = vm.categories[idx + 1];
            vm.categories[idx + 1] = vm.categories[idx];
            vm.categories[idx] = tmp;
            _saveOrder();
        };

        function _saveOrder() {
            var ids = vm.categories.map(function (c) { return c.id; });
            AdminService.reorderCategories(ids).catch(function () {
                UiFeedbackService.error('Erro ao reordenar categorias.');
                loadCategories(); // revert
            });
        }

        // ---- Load ----------------------------------------------------------
        function loadCategories() {
            vm.loading = true;
            AdminService.getCategories()
                .then(function (cats) { vm.categories = cats; })
                .catch(function () { UiFeedbackService.error('Erro ao carregar categorias.'); })
                .finally(function () { vm.loading = false; });
        }

        loadCategories();
    }
})();
