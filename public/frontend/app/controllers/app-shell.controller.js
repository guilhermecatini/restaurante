(function () {
  'use strict';

  angular.module('deliveryApp').controller('AppShellController', AppShellController);

  AppShellController.$inject = ['$state', 'AuthService', 'CartService', 'LoadingService', 'TenantService'];
  function AppShellController($state, AuthService, CartService, LoadingService, TenantService) {
    var vm = this;

    vm.isAuthenticated = AuthService.isAuthenticated;
    vm.currentUser = AuthService.getCurrentUser;
    vm.cartCount = CartService.getItemsCount;
    vm.isLoading = LoadingService.isLoading;
    vm.tenant = TenantService.getContext;
    vm.tenantBadgeLabel = tenantBadgeLabel;

    vm.goToStore = function () {
      $state.go('app.storefront');
    };

    vm.goToLogin = function () {
      $state.go('auth.login');
    };

    vm.logout = function () {
      AuthService.logout();
    };

    function tenantBadgeLabel() {
      var ctx = TenantService.getContext() || {};
      var restaurant = ctx.restaurant || {};

      if (restaurant.tradeName) return restaurant.tradeName;
      if (restaurant.trade_name) return restaurant.trade_name;
      if (restaurant.subdomain) return '@' + restaurant.subdomain;
      if (ctx.key) return '@' + ctx.key;
      return '';
    }
  }
})();
