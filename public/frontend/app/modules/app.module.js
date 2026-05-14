(function () {
  'use strict';

  angular
    .module('deliveryApp', [
      'ui.router',
      'ngAnimate',
      'ngSanitize',
      'deliveryApp.core',
      'deliveryApp.auth',
      'deliveryApp.customer',
    ])
    .config(config)
    .run(run);

  config.$inject = ['$httpProvider'];
  function config($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ErrorInterceptor');
  }

  run.$inject = ['AuthService', 'CartService', 'TenantService'];
  function run(AuthService, CartService, TenantService) {
    TenantService.getTenantKey();
    AuthService.bootstrapSession();
    CartService.bootstrap();
  }
})();
