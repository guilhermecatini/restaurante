(function () {
  'use strict';

  angular.module('deliveryApp.customer').controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = ['CartService', 'AddressService', 'OrderService', 'UiFeedbackService', 'AuthService', '$state'];
  function CheckoutController(CartService, AddressService, OrderService, UiFeedbackService, AuthService, $state) {
    var vm = this;

    vm.cart = CartService.getCart();
    vm.subtotal = CartService.getSubtotal;
    vm.addresses = [];
    vm.selectedAddressId = null;
    vm.coupon = '';
    vm.couponResult = null;
    vm.placing = false;

    vm.orderForm = {
      order_type: 'delivery',
      payment_method: 'pix',
      customer_notes: '',
    };

    vm.newAddress = {
      zip_code: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: 'Brazil',
      label: 'Home',
      is_default: false,
      reference_note: '',
    };

    vm.loadAddresses = function () {
      AddressService.list().then(function (items) {
        vm.addresses = (items || []).map(function (address) {
          var resolvedAddressId = address.addressId || address.address_id;
          var isDefault = Boolean(address.isDefault || address.is_default);
          return Object.assign({}, address, {
            address_id: resolvedAddressId,
            addressId: resolvedAddressId,
            is_default: isDefault,
            isDefault: isDefault,
          });
        });

        var defaultAddress = vm.addresses.find(function (address) { return address.is_default; });
        if (defaultAddress) vm.selectedAddressId = defaultAddress.address_id;
      });
    };

    vm.createAddress = function () {
      AddressService.create(vm.newAddress).then(function () {
        UiFeedbackService.success('Endereco cadastrado com sucesso.');
        vm.loadAddresses();
      });
    };

    vm.applyCoupon = function () {
      if (!vm.coupon) return;
      OrderService.validateCoupon(vm.coupon, vm.cart.restaurant_id || vm.cart.restaurantId).then(function (result) {
        vm.couponResult = result;
        if (result && result.valid) {
          CartService.setCoupon(vm.coupon);
          UiFeedbackService.success('Cupom valido.');
        } else {
          UiFeedbackService.info((result && result.message) || 'Cupom invalido.');
        }
      });
    };

    vm.placeOrder = function () {
      if (!vm.cart.items.length) {
        UiFeedbackService.info('Seu carrinho esta vazio.');
        return;
      }

      if (vm.orderForm.order_type === 'delivery' && !vm.selectedAddressId) {
        UiFeedbackService.info('Selecione um endereco de entrega.');
        return;
      }

      vm.placing = true;
      CartService.syncToServer()
        .then(function (serverCart) {
          return OrderService.place({
            cart_id: serverCart.id,
            delivery_address_id: vm.orderForm.order_type === 'delivery' ? Number(vm.selectedAddressId) : null,
            order_type: vm.orderForm.order_type,
            coupon_code: vm.cart.coupon_code || null,
            payment_method: vm.orderForm.payment_method,
            customer_notes: vm.orderForm.customer_notes || null,
          });
        })
        .then(function (response) {
          CartService.clear();
          UiFeedbackService.success(response.message || 'Pedido realizado com sucesso.');
          $state.go('app.storefront');
        })
        .finally(function () {
          vm.placing = false;
        });
    };

    if (!AuthService.isAuthenticated()) {
      $state.go('auth.login', { returnTo: 'app.checkout' });
      return;
    }

    vm.loadAddresses();
  }
})();
