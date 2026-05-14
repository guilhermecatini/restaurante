(function () {
  'use strict';

  angular.module('deliveryApp').factory('AuthInterceptor', AuthInterceptor);

  AuthInterceptor.$inject = ['StorageService', 'APP_CONFIG'];
  function AuthInterceptor(StorageService, APP_CONFIG) {
    return {
      request: function (config) {
        var isApiCall = config.url && config.url.indexOf(APP_CONFIG.API_BASE_URL) === 0;
        if (!isApiCall) return config;

        var token = StorageService.get(APP_CONFIG.STORAGE_KEYS.accessToken);
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },
    };
  }
})();
