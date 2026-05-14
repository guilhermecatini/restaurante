(function () {
  'use strict';

  angular.module('deliveryApp.auth').controller('LoginController', LoginController);

  LoginController.$inject = ['AuthService', '$state', '$stateParams', 'UiFeedbackService'];
  function LoginController(AuthService, $state, $stateParams, UiFeedbackService) {
    var vm = this;

    vm.form = {
      email: '',
      password: '',
    };
    vm.loading = false;

    vm.submit = function () {
      vm.loading = true;
      AuthService.login(vm.form)
        .then(function () {
          UiFeedbackService.success('Login realizado com sucesso.');
          $state.go($stateParams.returnTo || 'app.storefront');
        })
        .finally(function () {
          vm.loading = false;
        });
    };

    vm.socialLogin = function (provider) {
      UiFeedbackService.info('Fluxo de ' + provider + ' pronto para integracao backend/OAuth.');
    };
  }
})();
