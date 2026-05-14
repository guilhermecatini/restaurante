(function () {
  'use strict';

  angular.module('deliveryApp.customer').controller('RestaurantListController', RestaurantListController);

  RestaurantListController.$inject = ['PublicService', '$state', '$stateParams'];
  function RestaurantListController(PublicService, $state, $stateParams) {
    var vm = this;

    vm.filters = {
      search: $stateParams.search || '',
      city: $stateParams.city || '',
      is_open: $stateParams.is_open || '',
      page: Number($stateParams.page || 1),
    };

    vm.restaurants = [];
    vm.loading = true;
    vm.meta = null;

    vm.applyFilters = function () {
      vm.filters.page = 1;
      vm.fetch();
    };

    vm.changePage = function (delta) {
      vm.filters.page = Math.max(1, vm.filters.page + delta);
      vm.fetch();
    };

    vm.openRestaurant = function (restaurant) {
      $state.go('app.restaurant', { restaurantId: restaurant.id });
    };

    vm.fetch = function () {
      vm.loading = true;
      PublicService.listRestaurants({
        page: vm.filters.page,
        per_page: 12,
        city: vm.filters.city || undefined,
        is_open: vm.filters.is_open || undefined,
      })
        .then(function (data) {
          var baseList = data.data || [];
          var term = (vm.filters.search || '').trim().toLowerCase();
          vm.restaurants = term
            ? baseList.filter(function (item) {
                return String(item.trade_name || '').toLowerCase().indexOf(term) >= 0;
              })
            : baseList;
          vm.meta = data.meta && data.meta.pagination ? data.meta.pagination : null;
          $state.go('app.restaurants', vm.filters, { notify: false, location: 'replace' });
        })
        .finally(function () {
          vm.loading = false;
        });
    };

    vm.fetch();
  }
})();
