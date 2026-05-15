(function () {
  'use strict';

  angular.module('deliveryApp.core').service('UiFeedbackService', UiFeedbackService);

  UiFeedbackService.$inject = ['$window'];
  function UiFeedbackService($window) {
    function show(icon, title, message) {
      if ($window.Swal && typeof $window.Swal.fire === 'function') {
        return $window.Swal.fire({
          icon: icon,
          title: title,
          text: message,
          confirmButtonText: 'OK',
        });
      }

      $window.alert(message);
      return null;
    }

    this.success = function (message) {
      return show('success', 'Sucesso', message || 'Operacao realizada com sucesso.');
    };

    this.error = function (message) {
      return show('error', 'Erro', message || 'Ocorreu um erro.');
    };

    this.info = function (message) {
      return show('info', 'Informacao', message || 'Informacao.');
    };
  }
})();
