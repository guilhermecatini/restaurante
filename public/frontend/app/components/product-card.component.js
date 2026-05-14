(function () {
  'use strict';

  angular.module('deliveryApp.customer').component('productCard', {
    bindings: {
      product: '<',
      onCustomize: '&',
    },
    templateUrl: 'views/shared/product-card.html',
  });
})();
