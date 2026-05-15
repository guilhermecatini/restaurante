(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminSettingsController', AdminSettingsController);

    AdminSettingsController.$inject = ['AdminService', 'UiFeedbackService'];
    function AdminSettingsController(AdminService, UiFeedbackService) {
        var vm = this;

        vm.activeTab = 'profile';
        vm.loading = true;
        vm.saving = false;
        vm.profile = {};
        vm.hours = [];
        vm.restaurant = {};

        vm.tabs = [
            { id: 'profile', label: 'Perfil', icon: 'bi-shop' },
            { id: 'hours', label: 'Horários', icon: 'bi-clock' },
            { id: 'status', label: 'Status', icon: 'bi-power' },
        ];

        var DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        vm.setTab = function (id) { vm.activeTab = id; };

        vm.dayName = function (dayOfWeek) { return DAY_NAMES[dayOfWeek] || 'Dia ' + dayOfWeek; };

        // ---- Profile -------------------------------------------------------
        vm.saveProfile = function () {
            if (vm.saving) return;
            vm.saving = true;
            AdminService.updateProfile(vm.profile)
                .then(function (updated) {
                    vm.profile = updated;
                    UiFeedbackService.success('Perfil atualizado!');
                })
                .catch(function (err) {
                    var msg = (err && err.data && err.data.message) || 'Erro ao salvar perfil.';
                    UiFeedbackService.error(msg);
                })
                .finally(function () { vm.saving = false; });
        };

        // ---- Hours ---------------------------------------------------------
        vm.saveHours = function () {
            if (vm.saving) return;
            vm.saving = true;
            AdminService.bulkUpdateHours(vm.hours)
                .then(function () { UiFeedbackService.success('Horários salvos!'); })
                .catch(function () { UiFeedbackService.error('Erro ao salvar horários.'); })
                .finally(function () { vm.saving = false; });
        };

        // ---- Open/Close toggle ---------------------------------------------
        vm.toggleStatus = function () {
            AdminService.toggleRestaurantStatus()
                .then(function (updated) {
                    vm.restaurant.is_open = updated.is_open;
                    var msg = vm.restaurant.is_open ? 'Loja aberta!' : 'Loja fechada!';
                    UiFeedbackService.success(msg);
                })
                .catch(function () { UiFeedbackService.error('Erro ao alterar status.'); });
        };

        // ---- Init ----------------------------------------------------------
        function init() {
            vm.loading = true;
            var p1 = AdminService.getProfile()
                .then(function (data) { vm.profile = data; vm.restaurant = data; })
                .catch(angular.noop);

            var p2 = AdminService.getHours()
                .then(function (hours) {
                    // Ensure all 7 days present
                    var indexed = {};
                    hours.forEach(function (h) { indexed[h.day_of_week] = h; });
                    vm.hours = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
                        return indexed[d] || { day_of_week: d, is_open: false, open_time: '08:00', close_time: '22:00' };
                    });
                })
                .catch(angular.noop);

            Promise.all([p1, p2]).finally(function () { vm.loading = false; });
        }

        init();
    }
})();
