(function () {
  'use strict';

  angular.module('deliveryApp.core').service('StorageService', StorageService);

  StorageService.$inject = ['$window'];
  function StorageService($window) {
    this.get = function (key, fallback) {
      var value = $window.localStorage.getItem(key);
      if (value == null) return fallback;
      try {
        return JSON.parse(value);
      } catch (_err) {
        return value;
      }
    };

    this.set = function (key, value) {
      if (typeof value === 'string') {
        $window.localStorage.setItem(key, value);
      } else {
        $window.localStorage.setItem(key, JSON.stringify(value));
      }
    };

    this.remove = function (key) {
      $window.localStorage.removeItem(key);
    };

    this.clear = function () {
      $window.localStorage.clear();
    };
  }
})();
