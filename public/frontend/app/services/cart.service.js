(function () {
  'use strict';

  angular.module('deliveryApp.customer').service('CartService', CartService);

  CartService.$inject = ['StorageService', 'APP_CONFIG', 'AuthService', 'ApiService', '$q', 'TenantService'];
  function CartService(StorageService, APP_CONFIG, AuthService, ApiService, $q, TenantService) {
    var guestCart = null;

    function getTenantCartKey() {
      var tenantKey = TenantService.getTenantKey() || 'default';
      return APP_CONFIG.STORAGE_KEYS.guestCart + '_' + tenantKey;
    }

    function emptyCart() {
      return {
        restaurant_id: null,
        coupon_code: null,
        items: [],
      };
    }

    function persist() {
      StorageService.set(getTenantCartKey(), guestCart);
    }

    function ensureCart() {
      if (!guestCart) guestCart = StorageService.get(getTenantCartKey(), emptyCart());
      if (!guestCart || !Array.isArray(guestCart.items)) guestCart = emptyCart();
      return guestCart;
    }

    this.bootstrap = function () {
      ensureCart();
    };

    this.getCart = function () {
      return ensureCart();
    };

    this.getItemsCount = function () {
      return ensureCart().items.reduce(function (acc, item) {
        return acc + Number(item.quantity || 0);
      }, 0);
    };

    this.getSubtotal = function () {
      return ensureCart().items.reduce(function (acc, item) {
        var addonsTotal = (item.addons || []).reduce(function (sum, addon) {
          return sum + (Number(addon.price_delta || addon.unit_price || 0) * Number(addon.quantity || 1));
        }, 0);
        return acc + (Number(item.unit_price || 0) * Number(item.quantity || 1)) + addonsTotal;
      }, 0);
    };

    this.addProduct = function (restaurantId, product, quantity, notes, addons) {
      var cart = ensureCart();

      if (!restaurantId) return false;
      if (cart.restaurant_id && Number(cart.restaurant_id) !== Number(restaurantId)) {
        return false;
      }

      cart.restaurant_id = Number(restaurantId);

      var existing = cart.items.find(function (it) {
        return Number(it.product_id || 0) === Number(product.id || 0) && (it.customer_notes || '') === (notes || '');
      });

      if (existing) {
        existing.quantity += Number(quantity || 1);
      } else {
        cart.items.push({
          local_id: Date.now() + '-' + Math.random().toString(16).slice(2),
          product_id: product.id || null,
          combo_id: product.combo_id || null,
          product_name: product.name,
          quantity: Number(quantity || 1),
          unit_price: Number(product.base_price || product.combo_price || 0),
          customer_notes: notes || null,
          addons: (addons || []).map(function (addon) {
            return {
              addon_id: addon.id,
              name: addon.name,
              quantity: Number(addon.quantity || 1),
              price_delta: Number(addon.price_delta || 0),
            };
          }),
        });
      }

      persist();
      return true;
    };

    this.updateItemQuantity = function (localId, quantity) {
      var cart = ensureCart();
      cart.items = cart.items.map(function (item) {
        if (item.local_id !== localId) return item;
        return angular.extend({}, item, { quantity: Math.max(1, Number(quantity || 1)) });
      });
      persist();
    };

    this.removeItem = function (localId) {
      var cart = ensureCart();
      cart.items = cart.items.filter(function (item) {
        return item.local_id !== localId;
      });
      if (!cart.items.length) {
        cart.restaurant_id = null;
        cart.coupon_code = null;
      }
      persist();
    };

    this.clear = function () {
      guestCart = emptyCart();
      persist();
    };

    this.setCoupon = function (code) {
      var cart = ensureCart();
      cart.coupon_code = code || null;
      persist();
    };

    this.fetchServerCart = function (restaurantId) {
      return ApiService.get('/customer/cart', { restaurant_id: restaurantId }).then(function (res) {
        return res.data.data;
      });
    };

    this.syncToServer = function () {
      var cart = ensureCart();
      if (!AuthService.isAuthenticated()) {
        return $q.reject(new Error('Nao autenticado'));
      }
      if (!cart.restaurant_id || !cart.items.length) {
        return $q.reject(new Error('Carrinho vazio'));
      }

      return ApiService.delete('/customer/cart', { restaurant_id: cart.restaurant_id })
        .catch(function () {
          return true;
        })
        .then(function () {
          var chain = $q.resolve();
          cart.items.forEach(function (item) {
            chain = chain.then(function () {
              return ApiService.post('/customer/cart/items', {
                restaurant_id: cart.restaurant_id,
                product_id: item.product_id,
                combo_id: item.combo_id,
                quantity: item.quantity,
                customer_notes: item.customer_notes,
                addons: (item.addons || []).map(function (addon) {
                  return {
                    addon_id: addon.addon_id,
                    quantity: addon.quantity,
                  };
                }),
              });
            });
          });

          return chain.then(function () {
            return ApiService.get('/customer/cart', { restaurant_id: cart.restaurant_id });
          }).then(function (res) {
            return res.data.data;
          });
        });
    };
  }
})();
