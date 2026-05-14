(function () {
  'use strict';

  angular.module('deliveryApp.customer').component('restaurantCard', {
    bindings: {
      restaurant: '<',
      onOpen: '&',
    },
    templateUrl: 'views/shared/restaurant-card.html',
  });
})();
