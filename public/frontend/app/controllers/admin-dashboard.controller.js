(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminDashboardController', AdminDashboardController);

    AdminDashboardController.$inject = ['AdminService', 'UiFeedbackService'];
    function AdminDashboardController(AdminService, UiFeedbackService) {
        var vm = this;

        vm.loading = true;
        vm.summary = {};
        vm.topProducts = [];
        vm.period = '7d';  // '1d' | '7d' | '30d'

        vm.selectPeriod = function (p) {
            vm.period = p;
            _loadStats();
        };

        function _loadStats() {
            AdminService.getOrdersStats({ period: vm.period })
                .then(function (data) { vm.stats = data; })
                .catch(angular.noop);
        }

        function init() {
            vm.loading = true;

            var p1 = AdminService.getDashboardSummary()
                .then(function (data) { vm.summary = data; })
                .catch(angular.noop);

            var p2 = AdminService.getTopProducts({ limit: 8 })
                .then(function (data) { vm.topProducts = data; })
                .catch(angular.noop);

            var p3 = AdminService.getOrdersStats({ period: vm.period })
                .then(function (data) { vm.stats = data; })
                .catch(angular.noop);

            Promise.all([p1, p2, p3]).finally(function () { vm.loading = false; });
        }

        init();
    }
})();
