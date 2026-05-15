(function () {
  'use strict';

  angular.module('deliveryApp.customer').service('OrderService', OrderService);

  OrderService.$inject = ['ApiService'];
  function OrderService(ApiService) {
    this.validateCoupon = function (couponCode, restaurantId) {
      return ApiService.post('/customer/cart/validate-coupon', {
        coupon_code: couponCode,
        restaurant_id: restaurantId,
      }).then(function (res) {
        return res.data.data;
      });
    };

    this.place = function (payload) {
      return ApiService.post('/customer/orders', payload).then(function (res) {
        return res.data;
      });
    };

    this.list = function (params) {
      return ApiService.get('/customer/orders', params).then(function (res) {
        return res.data;
      });
    };

    this.get = function (orderId) {
      return ApiService.get('/customer/orders/' + orderId).then(function (res) {
        return res.data.data;
      });
    };

    this.track = function (orderId) {
      return ApiService.get('/customer/orders/' + orderId + '/track').then(function (res) {
        return res.data.data;
      });
    };

    this.cancel = function (orderId) {
      return ApiService.post('/customer/orders/' + orderId + '/cancel').then(function (res) {
        return res.data;
      });
    };
  }
})();
