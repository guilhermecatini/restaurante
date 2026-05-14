(function () {
  'use strict';

  angular.module('deliveryApp.customer').service('AddressService', AddressService);

  AddressService.$inject = ['ApiService'];
  function AddressService(ApiService) {
    this.list = function () {
      return ApiService.get('/customer/addresses').then(function (res) {
        return res.data.data || [];
      });
    };

    this.create = function (payload) {
      return ApiService.post('/customer/addresses', payload).then(function (res) {
        return res.data;
      });
    };

    this.setDefault = function (addressId) {
      return ApiService.patch('/customer/addresses/' + addressId + '/default').then(function (res) {
        return res.data;
      });
    };
  }
})();
