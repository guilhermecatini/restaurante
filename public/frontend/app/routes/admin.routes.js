(function () {
    'use strict';

    angular.module('deliveryApp.admin').config(adminRouteConfig);

    adminRouteConfig.$inject = ['$stateProvider'];
    function adminRouteConfig($stateProvider) {

        // ------------------------------------------------------------------
        // Guard: requer autenticação + role de staff
        // ------------------------------------------------------------------
        function requireAdminAccess(AuthService, AdminService, $state, $q) {
            if (!AuthService.isAuthenticated()) {
                $state.go('admin.login');
                return $q.reject('NOT_AUTHENTICATED');
            }

            var user = AuthService.getCurrentUser();
            var userType = user && (user.user_type || user.userType || '');
            var isStaff = /restaurant_staff|restaurant_owner|restaurant_manager|restaurant_operator|platform_admin|super_admin/.test(userType);

            // Se não temos info de role ainda, tenta buscar do servidor
            if (!isStaff && !user) {
                return AuthService.fetchMe()
                    .then(function (me) {
                        var type = me && (me.user_type || me.userType || '');
                        if (!/restaurant_staff|restaurant_owner|restaurant_manager|restaurant_operator|platform_admin|super_admin/.test(type)) {
                            $state.go('admin.login');
                            return $q.reject('NOT_AUTHORIZED');
                        }
                        return resolveRestaurant(AdminService, $state, $q);
                    })
                    .catch(function () {
                        $state.go('admin.login');
                        return $q.reject('NOT_AUTHORIZED');
                    });
            }

            if (!isStaff) {
                $state.go('admin.login');
                return $q.reject('NOT_AUTHORIZED');
            }

            return resolveRestaurant(AdminService, $state, $q);
        }
        requireAdminAccess.$inject = ['AuthService', 'AdminService', '$state', '$q'];

        function resolveRestaurant(AdminService, $state, $q) {
            if (AdminService.getRestaurantId()) return $q.resolve();

            return AdminService.getMyRestaurants().then(function (restaurants) {
                if (!restaurants || restaurants.length === 0) {
                    $state.go('admin.login');
                    return $q.reject('NO_RESTAURANT');
                }
                // Auto-seleciona o primeiro restaurante disponível
                AdminService.setRestaurantId(restaurants[0].id);
                return $q.resolve();
            }).catch(function () {
                $state.go('admin.login');
                return $q.reject('FAILED');
            });
        }

        // ------------------------------------------------------------------
        // States
        // ------------------------------------------------------------------
        $stateProvider

            // Shell abstract (com sidebar)
            .state('admin', {
                abstract: true,
                url: '/admin',
                templateUrl: 'app/layouts/admin-shell.html',
                controller: 'AdminShellController',
                controllerAs: 'vm',
                resolve: { access: requireAdminAccess },
            })

            // Dashboard
            .state('admin.dashboard', {
                url: '',
                templateUrl: 'views/admin/dashboard.html',
                controller: 'AdminDashboardController',
                controllerAs: 'vm',
            })

            // Orders
            .state('admin.orders', {
                url: '/orders?status&page',
                templateUrl: 'views/admin/orders.html',
                controller: 'AdminOrdersController',
                controllerAs: 'vm',
                params: { status: { value: null, squash: true }, page: { value: '1', squash: true } },
            })

            // Products
            .state('admin.products', {
                url: '/products?page&q&categoryId',
                templateUrl: 'views/admin/products.html',
                controller: 'AdminProductsController',
                controllerAs: 'vm',
                params: {
                    page: { value: '1', squash: true },
                    q: { value: null, squash: true },
                    categoryId: { value: null, squash: true },
                },
            })

            // Categories
            .state('admin.categories', {
                url: '/categories',
                templateUrl: 'views/admin/categories.html',
                controller: 'AdminCategoriesController',
                controllerAs: 'vm',
            })

            // Coupons
            .state('admin.coupons', {
                url: '/coupons?page',
                templateUrl: 'views/admin/coupons.html',
                controller: 'AdminCouponsController',
                controllerAs: 'vm',
                params: { page: { value: '1', squash: true } },
            })

            // Settings
            .state('admin.settings', {
                url: '/settings',
                templateUrl: 'views/admin/settings.html',
                controller: 'AdminSettingsController',
                controllerAs: 'vm',
            })

            // Team
            .state('admin.team', {
                url: '/team',
                templateUrl: 'views/admin/team.html',
                controller: 'AdminTeamController',
                controllerAs: 'vm',
            })

            // Login (sem shell)
            .state('admin.login', {
                url: '/login',
                templateUrl: 'views/admin/login.html',
                controller: 'AdminLoginController',
                controllerAs: 'vm',
            });
    }
})();
