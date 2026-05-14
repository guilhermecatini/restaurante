(function () {
  'use strict';

  angular.module('deliveryApp.customer').controller('StorefrontController', StorefrontController);

  StorefrontController.$inject = ['PublicService', 'CartService', 'UiFeedbackService', '$q', 'TenantService'];
  function StorefrontController(PublicService, CartService, UiFeedbackService, $q, TenantService) {
    var vm = this;

    vm.restaurant = null;
    vm.menu = [];
    vm.reviews = [];
    vm.loading = true;
    vm.tenantKey = TenantService.getTenantKey();
    vm.notFound = false;

    vm.modal = {
      open: false,
      item: null,
      quantity: 1,
      notes: '',
      selectedAddons: {},
    };

    vm.openCustomizer = function (product) {
      vm.modal.open = true;
      vm.modal.item = product;
      vm.modal.quantity = 1;
      vm.modal.notes = '';
      vm.modal.selectedAddons = {};
    };

    vm.closeCustomizer = function () {
      vm.modal.open = false;
      vm.modal.item = null;
    };

    vm.toggleAddon = function (addon) {
      if (vm.modal.selectedAddons[addon.id]) {
        delete vm.modal.selectedAddons[addon.id];
      } else {
        vm.modal.selectedAddons[addon.id] = {
          id: addon.id,
          name: addon.name,
          price_delta: addon.price_delta,
          quantity: 1,
        };
      }
    };

    vm.addToCart = function () {
      var product = vm.modal.item;
      if (!product || !vm.restaurant) return;

      var addons = Object.keys(vm.modal.selectedAddons).map(function (key) {
        return vm.modal.selectedAddons[key];
      });

      var added = CartService.addProduct(
        Number(vm.restaurant.id),
        product,
        vm.modal.quantity,
        vm.modal.notes,
        addons
      );

      if (!added) {
        UiFeedbackService.info('Seu carrinho contem itens de outro restaurante. Esvazie o carrinho para continuar.');
        return;
      }

      UiFeedbackService.success('Item adicionado ao carrinho.');
      vm.closeCustomizer();
    };

    function load() {
      vm.loading = true;

      TenantService.resolveTenantContext()
        .then(function (ctx) {
          vm.restaurant = ctx.restaurant;
          return $q.all([
            PublicService.getRestaurant(vm.restaurant.id),
            PublicService.getMenu(vm.restaurant.id),
            PublicService.getReviews(vm.restaurant.id, { page: 1, per_page: 5 }),
          ]);
        })
        .then(function (result) {
          vm.restaurant = result[0];
          vm.menu = (result[1] && result[1].categories) || [];
          vm.reviews = (result[2] && result[2].data) || [];
        })
        .catch(function (error) {
          vm.notFound = error && error.message === 'TENANT_NOT_FOUND';
          if (!vm.notFound) {
            UiFeedbackService.error('Nao foi possivel carregar a loja deste restaurante.');
          }
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    load();
  }
})();
