(function () {
  'use strict';

  angular.module('deliveryApp.core').service('ApiService', ApiService);

  ApiService.$inject = ['$http', 'APP_CONFIG', 'LoadingService'];
  function ApiService($http, APP_CONFIG, LoadingService) {
    function request(method, path, options) {
      options = options || {};
      LoadingService.start();

      return $http({
        method: method,
        url: APP_CONFIG.API_BASE_URL + path,
        params: options.params,
        data: options.data,
      }).finally(function () {
        LoadingService.stop();
      });
    }

    this.get = function (path, params) {
      return request('GET', path, { params: params });
    };

    this.post = function (path, data) {
      return request('POST', path, { data: data });
    };

    this.put = function (path, data) {
      return request('PUT', path, { data: data });
    };

    this.patch = function (path, data) {
      return request('PATCH', path, { data: data });
    };

    this.delete = function (path, params) {
      return request('DELETE', path, { params: params });
    };
  }
})();
