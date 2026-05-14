(function () {
  'use strict';

  angular.module('deliveryApp.core').directive('phoneMask', phoneMask);

  function phoneMask() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (_scope, element, _attrs, ngModel) {
        function format(value) {
          if (!value) return '';
          var digits = String(value).replace(/\D/g, '').slice(0, 11);
          if (digits.length <= 10) {
            return digits
              .replace(/(\d{2})(\d)/, '($1) $2')
              .replace(/(\d{4})(\d)/, '$1-$2');
          }
          return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
        }

        ngModel.$parsers.push(function (value) {
          var formatted = format(value);
          ngModel.$setViewValue(formatted);
          ngModel.$render();
          return formatted;
        });

        element.on('blur', function () {
          var formatted = format(element.val());
          element.val(formatted);
        });
      },
    };
  }
})();
