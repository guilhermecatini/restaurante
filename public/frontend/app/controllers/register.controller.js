(function () {
  'use strict';

  angular.module('deliveryApp.auth').controller('RegisterController', RegisterController);

  RegisterController.$inject = ['AuthService', '$state', '$stateParams', 'UiFeedbackService'];
  function RegisterController(AuthService, $state, $stateParams, UiFeedbackService) {
    var vm = this;

    vm.form = {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      password: '',
      password_confirmation: '',
    };
    vm.loading = false;

    vm.submit = function () {
      vm.loading = true;
      AuthService.register(vm.form)
        .then(function () {
          UiFeedbackService.success('Cadastro realizado com sucesso.');
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
