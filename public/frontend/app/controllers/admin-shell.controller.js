(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminShellController', AdminShellController);

    AdminShellController.$inject = ['$state', 'AuthService', 'AdminService', 'UiFeedbackService'];
    function AdminShellController($state, AuthService, AdminService, UiFeedbackService) {
        var vm = this;

        var PAGE_TITLES = {
            'admin.dashboard': 'Dashboard',
            'admin.orders': 'Pedidos',
            'admin.products': 'Produtos',
            'admin.categories': 'Categorias',
            'admin.coupons': 'Cupons',
            'admin.settings': 'Configurações',
            'admin.team': 'Equipe',
        };

        var ROLE_LABELS = {
            restaurant_owner: 'Proprietário',
            restaurant_manager: 'Gerente',
            restaurant_operator: 'Operador',
            platform_admin: 'Admin da Plataforma',
            super_admin: 'Super Admin',
        };

        // State
        vm.sidebarOpen = false;
        vm.restaurant = {};
        vm.pendingOrders = 0;
        vm.user = {};
        vm.userInitial = '?';
        vm.roleLabel = '';
        vm.pageTitle = '';

        // ---- Sidebar -------------------------------------------------------
        vm.toggleSidebar = function () { vm.sidebarOpen = !vm.sidebarOpen; };
        vm.closeSidebar = function () { vm.sidebarOpen = false; };

        // ---- Restaurant status toggle --------------------------------------
        vm.toggleStatus = function () {
            AdminService.toggleRestaurantStatus()
                .then(function (res) {
                    vm.restaurant.is_open = res.is_open;
                    var msg = vm.restaurant.is_open ? 'Loja aberta!' : 'Loja fechada!';
                    UiFeedbackService.success(msg);
                })
                .catch(function () { UiFeedbackService.error('Erro ao alterar status da loja.'); });
        };

        // ---- Logout --------------------------------------------------------
        vm.logout = function () {
            AuthService.logout();
            AdminService.clearRestaurantId();
            $state.go('admin.login');
        };

        // ---- Init ----------------------------------------------------------
        function init() {
            vm.user = AuthService.getCurrentUser() || {};
            var name = vm.user.name || vm.user.email || 'U';
            vm.userInitial = name.charAt(0).toUpperCase();
            var role = vm.user.role || vm.user.user_role || '';
            vm.roleLabel = ROLE_LABELS[role] || 'Colaborador';

            // Current page title (updated on state change by watching $state)
            vm.pageTitle = PAGE_TITLES[$state.current.name] || 'Painel';

            // Load profile
            AdminService.getProfile()
                .then(function (profile) { vm.restaurant = profile; })
                .catch(angular.noop);

            // Load pending orders count
            AdminService.getOrders({ status: 'pending', limit: 0 })
                .then(function (res) { vm.pendingOrders = res.total || 0; })
                .catch(angular.noop);
        }

        init();
    }
})();
