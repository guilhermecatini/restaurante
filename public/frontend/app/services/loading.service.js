(function () {
  'use strict';

  angular.module('deliveryApp.core').service('LoadingService', LoadingService);

  function LoadingService() {
    var pending = 0;

    this.start = function () {
      pending += 1;
    };

    this.stop = function () {
      pending = Math.max(0, pending - 1);
    };

    this.isLoading = function () {
      return pending > 0;
    };
  }
})();
