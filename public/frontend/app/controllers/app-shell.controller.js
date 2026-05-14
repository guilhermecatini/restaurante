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

    vm.goToStore = function () {
      $state.go('app.storefront');
    };

    vm.goToLogin = function () {
      $state.go('auth.login');
    };

    vm.logout = function () {
      AuthService.logout();
    };
  }
})();
