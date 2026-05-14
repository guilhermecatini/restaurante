(function () {
  'use strict';

  angular.module('deliveryApp.customer').controller('HomeController', HomeController);

  HomeController.$inject = ['PublicService', '$state'];
  function HomeController(PublicService, $state) {
    var vm = this;

    vm.featured = [];
    vm.loading = true;
    vm.bannerSlides = [
      { title: 'Entrega rapida', subtitle: 'Receba seu pedido em minutos.' },
      { title: 'Ofertas do dia', subtitle: 'Descontos especiais para voce.' },
      { title: 'Pagamento seguro', subtitle: 'Pix, cartao e dinheiro.' },
    ];

    vm.openRestaurant = function (restaurant) {
      $state.go('app.restaurant', { restaurantId: restaurant.id });
    };

    PublicService.listRestaurants({ per_page: 6, page: 1 })
      .then(function (data) {
        vm.featured = data.data || [];
      })
      .finally(function () {
        vm.loading = false;
      });
  }
})();
