(function () {
  'use strict';

  angular.module('deliveryApp.customer').service('PublicService', PublicService);

  PublicService.$inject = ['ApiService'];
  function PublicService(ApiService) {
    function normalize(value) {
      return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }

    this.listRestaurants = function (params) {
      return ApiService.get('/public/restaurants', params).then(function (res) {
        return res.data;
      });
    };

    this.resolveByTenant = function (tenantKey) {
      var key = normalize(tenantKey);
      return ApiService.get('/public/tenant/current', key ? { tenant: key } : undefined).then(function (res) {
        return res.data.data;
      });
    };

    this.getRestaurant = function (restaurantId) {
      return ApiService.get('/public/restaurants/' + restaurantId).then(function (res) {
        return res.data.data;
      });
    };

    this.getMenu = function (restaurantId) {
      return ApiService.get('/public/restaurants/' + restaurantId + '/menu').then(function (res) {
        return res.data.data;
      });
    };

    this.getReviews = function (restaurantId, params) {
      return ApiService.get('/public/restaurants/' + restaurantId + '/reviews', params).then(function (res) {
        return res.data;
      });
    };
  }
})();
