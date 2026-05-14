(function () {
  'use strict';

  angular.module('deliveryApp.core').filter('moneyBr', function () {
    return function (value) {
      var number = Number(value || 0);
      return number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    };
  });
})();
