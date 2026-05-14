(function () {
  'use strict';

  angular.module('deliveryApp').factory('ErrorInterceptor', ErrorInterceptor);

  ErrorInterceptor.$inject = ['$q', '$injector', 'APP_CONFIG', 'UiFeedbackService'];
  function ErrorInterceptor($q, $injector, APP_CONFIG, UiFeedbackService) {
    var refreshing = false;
    var queue = [];

    function flushQueue(error, token) {
      queue.forEach(function (item) {
        if (error) item.reject(error);
        else item.resolve(token);
      });
      queue = [];
    }

    return {
      responseError: function (rejection) {
        var status = rejection.status;
        var cfg = rejection.config || {};
        var isApiCall = cfg.url && cfg.url.indexOf(APP_CONFIG.API_BASE_URL) === 0;

        if (!isApiCall) return $q.reject(rejection);

        if (status === 401 && !cfg.__isRetryRequest && cfg.url.indexOf('/auth/refresh') === -1) {
          var $http = $injector.get('$http');
          var AuthService = $injector.get('AuthService');

          if (refreshing) {
            var deferred = $q.defer();
            queue.push({ resolve: deferred.resolve, reject: deferred.reject });
            return deferred.promise.then(function (token) {
              cfg.__isRetryRequest = true;
              cfg.headers = cfg.headers || {};
              cfg.headers.Authorization = 'Bearer ' + token;
              return $http(cfg);
            });
          }

          refreshing = true;
          return AuthService.refreshAccessToken()
            .then(function (token) {
              refreshing = false;
              flushQueue(null, token);
              cfg.__isRetryRequest = true;
              cfg.headers = cfg.headers || {};
              cfg.headers.Authorization = 'Bearer ' + token;
              return $http(cfg);
            })
            .catch(function (err) {
              refreshing = false;
              flushQueue(err, null);
              AuthService.forceLogout();
              return $q.reject(rejection);
            });
        }

        if (status >= 400) {
          var message = (rejection.data && rejection.data.message) || 'Ocorreu um erro ao processar a solicitacao.';
          UiFeedbackService.error(message);
        }

        return $q.reject(rejection);
      },
    };
  }
})();
