(function () {
  'use strict';

  angular.module('deliveryApp.core').service('TenantService', TenantService);

  TenantService.$inject = ['$window', '$q', 'PublicService', 'APP_CONFIG'];
  function TenantService($window, $q, PublicService, APP_CONFIG) {
    var context = {
      key: null,
      restaurant: null,
      resolved: false,
    };

    function sanitizeTenant(raw) {
      return String(raw || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '');
    }

    function extractFromHostname() {
      var hostname = ($window.location && $window.location.hostname) || '';
      if (!hostname || hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return '';
      }

      var segments = hostname.split('.').filter(Boolean);
      if (segments.length < 3) return '';
      return sanitizeTenant(segments[0]);
    }

    function extractFromQuery() {
      var search = ($window.location && $window.location.search) || '';
      if (!search) return '';
      var params = new URLSearchParams(search);
      return sanitizeTenant(params.get('tenant'));
    }

    function hashToPalette(seed) {
      var str = seed || 'tenant';
      var hash = 0;
      for (var i = 0; i < str.length; i += 1) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      var hue = Math.abs(hash) % 360;
      return {
        brand: 'hsl(' + hue + ', 78%, 50%)',
        brand2: 'hsl(' + ((hue + 22) % 360) + ', 82%, 60%)',
      };
    }

    function applyThemeFromRestaurant(restaurant) {
      var root = $window.document && $window.document.documentElement;
      if (!root || !restaurant) return;

      var colors = hashToPalette((context.key || '') + (restaurant.slug || restaurant.trade_name || ''));
      root.style.setProperty('--brand', colors.brand);
      root.style.setProperty('--brand-2', colors.brand2);
    }

    this.getTenantKey = function () {
      if (context.key) return context.key;
      context.key = extractFromQuery() || extractFromHostname() || APP_CONFIG.LOCAL_DEFAULT_TENANT;
      return context.key;
    };

    this.resolveTenantContext = function () {
      var self = this;
      if (context.resolved && context.restaurant) {
        return $q.resolve(context);
      }

      var tenantKey = self.getTenantKey();

      return PublicService.resolveByTenant(tenantKey)
        .then(function (payload) {
          if (!payload || !payload.restaurant) {
            return $q.reject(new Error('TENANT_NOT_FOUND'));
          }

          context.key = sanitizeTenant(payload.tenant_key || tenantKey || context.key);
          context.restaurant = payload.restaurant;
          context.resolved = true;
          applyThemeFromRestaurant(payload.restaurant);
          return context;
        })
        .catch(function (err) {
          if (APP_CONFIG.ALLOW_TENANT_FALLBACK && !tenantKey && APP_CONFIG.LOCAL_DEFAULT_TENANT) {
            return PublicService.resolveByTenant(APP_CONFIG.LOCAL_DEFAULT_TENANT).then(function (fallbackPayload) {
              if (!fallbackPayload || !fallbackPayload.restaurant) {
                return $q.reject(new Error('TENANT_NOT_FOUND'));
              }
              context.key = sanitizeTenant(fallbackPayload.tenant_key || APP_CONFIG.LOCAL_DEFAULT_TENANT);
              context.restaurant = fallbackPayload.restaurant;
              context.resolved = true;
              applyThemeFromRestaurant(fallbackPayload.restaurant);
              return context;
            });
          }

          var status = err && err.status;
          if (status === 404 || status === 400) {
            return $q.reject(new Error('TENANT_NOT_FOUND'));
          }
          return $q.reject(err);
        });
    };

    this.getContext = function () {
      return context;
    };

    this.getRestaurantId = function () {
      return context.restaurant ? Number(context.restaurant.id) : null;
    };

    this.getRestaurant = function () {
      return context.restaurant;
    };
  }
})();
