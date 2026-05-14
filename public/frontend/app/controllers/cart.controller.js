(function () {
  'use strict';

  angular.module('deliveryApp.customer').controller('CartController', CartController);

  CartController.$inject = ['CartService', '$state'];
  function CartController(CartService, $state) {
    var vm = this;

    vm.cart = CartService.getCart();
    vm.subtotal = CartService.getSubtotal;

    vm.increase = function (item) {
      CartService.updateItemQuantity(item.local_id, item.quantity + 1);
      vm.cart = CartService.getCart();
    };

    vm.decrease = function (item) {
      if (item.quantity <= 1) {
        CartService.removeItem(item.local_id);
      } else {
        CartService.updateItemQuantity(item.local_id, item.quantity - 1);
      }
      vm.cart = CartService.getCart();
    };

    vm.remove = function (item) {
      CartService.removeItem(item.local_id);
      vm.cart = CartService.getCart();
    };

    vm.clear = function () {
      CartService.clear();
      vm.cart = CartService.getCart();
    };

    vm.goCheckout = function () {
      $state.go('app.checkout');
    };
  }
})();
