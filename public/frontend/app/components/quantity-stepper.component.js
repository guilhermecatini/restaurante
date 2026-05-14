(function () {
  'use strict';

  angular.module('deliveryApp.customer').component('quantityStepper', {
    bindings: {
      value: '<',
      onIncrease: '&',
      onDecrease: '&',
    },
    templateUrl: 'views/shared/quantity-stepper.html',
  });
})();
