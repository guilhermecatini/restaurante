(function () {
    'use strict';

    angular.module('deliveryApp.admin').controller('AdminLoginController', AdminLoginController);

    AdminLoginController.$inject = ['$state', 'AuthService', 'AdminService', 'UiFeedbackService'];
    function AdminLoginController($state, AuthService, AdminService, UiFeedbackService) {
        var vm = this;

        var ALLOWED_TYPES = [
            'restaurant_staff',
            'restaurant_owner',
            'restaurant_manager',
            'restaurant_operator',
            'platform_admin',
            'super_admin',
        ];

        vm.form = { email: '', password: '' };
        vm.loading = false;
        vm.error = '';

        // Redirect if already authenticated
        if (AuthService.isAuthenticated()) {
            _resolveDestination();
        }

        vm.login = function () {
            if (vm.loading) return;
            vm.error = '';
            vm.loading = true;

            AuthService.login({ email: vm.form.email, password: vm.form.password })
                .then(function () {
                    var user = AuthService.getCurrentUser();
                    var type = user && (user.user_type || user.userType || '');
                    if (ALLOWED_TYPES.indexOf(type) === -1) {
                        AuthService.logout();
                        vm.error = 'Sem permissão para acessar o painel administrativo.';
                        vm.loading = false;
                        return;
                    }
                    return _resolveDestination();
                })
                .catch(function (err) {
                    var msg = (err && err.data && err.data.message) || 'E-mail ou senha inválidos.';
                    vm.error = msg;
                    vm.loading = false;
                });
        };

        function _resolveDestination() {
            if (AdminService.getRestaurantId()) {
                $state.go('admin.dashboard');
                return;
            }
            AdminService.getMyRestaurants()
                .then(function (restaurants) {
                    if (!restaurants || restaurants.length === 0) {
                        vm.error = 'Nenhum restaurante associado à sua conta.';
                        AuthService.logout();
                        vm.loading = false;
                        return;
                    }
                    // Futuramente: modal de seleção quando há mais de um restaurante
                    AdminService.setRestaurantId(restaurants[0].id);
                    $state.go('admin.dashboard');
                })
                .catch(function () {
                    vm.error = 'Erro ao carregar restaurantes.';
                    vm.loading = false;
                });
        }
    }
})();
