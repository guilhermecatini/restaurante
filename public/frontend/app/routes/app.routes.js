(function () {
  'use strict';

  angular.module('deliveryApp').config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
  function routeConfig($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'app/layouts/main-shell.html',
        controller: 'AppShellController',
        controllerAs: 'vm',
        resolve: {
          tenantContext: ['TenantService', function (TenantService) {
            return TenantService.resolveTenantContext().catch(function () {
              return null;
            });
          }],
        },
      })
      .state('app.storefront', {
        url: '/',
        templateUrl: 'views/customer/storefront.html',
        controller: 'StorefrontController',
        controllerAs: 'vm',
      })
      .state('app.cart', {
        url: '/cart',
        templateUrl: 'views/customer/cart.html',
        controller: 'CartController',
        controllerAs: 'vm',
      })
      .state('app.checkout', {
        url: '/checkout',
        templateUrl: 'views/customer/checkout.html',
        controller: 'CheckoutController',
        controllerAs: 'vm',
        resolve: {
          auth: ['AuthService', '$transition$', function (AuthService, $transition$) {
            return AuthService.requireAuth($transition$);
          }],
        },
      })
      .state('app.orders', {
        url: '/orders',
        templateUrl: 'views/customer/orders.html',
        controller: 'OrdersController',
        controllerAs: 'vm',
        resolve: {
          auth: ['AuthService', '$transition$', function (AuthService, $transition$) {
            return AuthService.requireAuth($transition$);
          }],
        },
      })
      .state('auth', {
        abstract: true,
        templateUrl: 'app/layouts/auth-shell.html',
      })
      .state('auth.login', {
        url: '/auth/login?returnTo',
        templateUrl: 'views/auth/login.html',
        controller: 'LoginController',
        controllerAs: 'vm',
      })
      .state('auth.register', {
        url: '/auth/register?returnTo',
        templateUrl: 'views/auth/register.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
      });

    $urlRouterProvider.otherwise('/');
  }
})();
