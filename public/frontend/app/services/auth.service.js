(function () {
  'use strict';

  angular.module('deliveryApp.auth').service('AuthService', AuthService);

  AuthService.$inject = ['ApiService', 'StorageService', 'APP_CONFIG', '$q', '$state'];
  function AuthService(ApiService, StorageService, APP_CONFIG, $q, $state) {
    var currentUser = StorageService.get(APP_CONFIG.STORAGE_KEYS.user, null);

    function getAccessToken() {
      return StorageService.get(APP_CONFIG.STORAGE_KEYS.accessToken, null);
    }

    function getRefreshToken() {
      return StorageService.get(APP_CONFIG.STORAGE_KEYS.refreshToken, null);
    }

    function setSession(payload) {
      var accessToken = payload.access_token;
      var refreshToken = payload.refresh_token;
      var user = payload.user || null;

      if (accessToken) StorageService.set(APP_CONFIG.STORAGE_KEYS.accessToken, accessToken);
      if (refreshToken) StorageService.set(APP_CONFIG.STORAGE_KEYS.refreshToken, refreshToken);
      if (user) {
        currentUser = user;
        StorageService.set(APP_CONFIG.STORAGE_KEYS.user, user);
      }
    }

    this.bootstrapSession = function () {
      if (!getAccessToken()) return;
      this.fetchMe().catch(function () {
        // ignora no boot; interceptor resolve no primeiro request protegido
      });
    };

    this.getAccessToken = function () {
      return getAccessToken();
    };

    this.getRefreshToken = function () {
      return getRefreshToken();
    };

    this.getCurrentUser = function () {
      return currentUser;
    };

    this.isAuthenticated = function () {
      return Boolean(getAccessToken());
    };

    this.login = function (credentials) {
      return ApiService.post('/auth/login', credentials).then(function (res) {
        setSession(res.data.data || {});
        return res.data.data;
      });
    };

    this.register = function (payload) {
      return ApiService.post('/auth/register', payload).then(function (res) {
        setSession(res.data.data || {});
        return res.data.data;
      });
    };

    this.fetchMe = function () {
      var self = this;
      return ApiService.get('/auth/me').then(function (res) {
        currentUser = res.data.data;
        StorageService.set(APP_CONFIG.STORAGE_KEYS.user, currentUser);
        return currentUser;
      }).catch(function (err) {
        if (err.status === 401) self.forceLogout();
        return $q.reject(err);
      });
    };

    this.refreshAccessToken = function () {
      var refreshToken = getRefreshToken();
      if (!refreshToken) return $q.reject(new Error('Sem refresh token'));

      return ApiService.post('/auth/refresh', { refresh_token: refreshToken }).then(function (res) {
        var token = res.data.data && res.data.data.access_token;
        if (!token) return $q.reject(new Error('Refresh sem access token'));
        StorageService.set(APP_CONFIG.STORAGE_KEYS.accessToken, token);
        return token;
      });
    };

    this.logout = function () {
      var refreshToken = getRefreshToken();
      var self = this;
      if (!refreshToken) {
        self.forceLogout();
        return $q.resolve();
      }

      return ApiService.post('/auth/logout', { refresh_token: refreshToken })
        .finally(function () {
          self.forceLogout();
        });
    };

    this.forceLogout = function () {
      currentUser = null;
      StorageService.remove(APP_CONFIG.STORAGE_KEYS.accessToken);
      StorageService.remove(APP_CONFIG.STORAGE_KEYS.refreshToken);
      StorageService.remove(APP_CONFIG.STORAGE_KEYS.user);
      if ($state.current && $state.current.name !== 'auth.login') {
        $state.go('auth.login');
      }
    };

    this.requireAuth = function ($transition$) {
      if (Boolean(getAccessToken())) {
        return this.fetchMe().catch(function () {
          return true;
        });
      }

      var target = ($transition$ && $transition$.to() && $transition$.to().name) || 'app.checkout';
      $state.go('auth.login', { returnTo: target });
      return $q.reject('AUTH_REQUIRED');
    };
  }
})();
