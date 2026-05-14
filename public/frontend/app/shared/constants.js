(function () {
  'use strict';

  angular.module('deliveryApp.core').constant('APP_CONFIG', {
    API_BASE_URL: '/api/v1',
    STORAGE_KEYS: {
      accessToken: 'delivery_access_token',
      refreshToken: 'delivery_refresh_token',
      user: 'delivery_user',
      guestCart: 'delivery_guest_cart',
    },
    DEFAULTS: {
      perPage: 12,
    },
    TENANT_RESOLVE_PAGE_SIZE: 200,
    LOCAL_DEFAULT_TENANT: '',
    ALLOW_TENANT_FALLBACK: true,
  });
})();
