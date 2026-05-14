(function () {
  'use strict';

  angular.module('deliveryApp.core').service('UiFeedbackService', UiFeedbackService);

  UiFeedbackService.$inject = ['$window'];
  function UiFeedbackService($window) {
    this.success = function (message) {
      $window.alert(message || 'Operacao realizada com sucesso.');
    };

    this.error = function (message) {
      $window.alert(message || 'Ocorreu um erro.');
    };

    this.info = function (message) {
      $window.alert(message || 'Informacao.');
    };
  }
})();
