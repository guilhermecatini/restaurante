(function () {
    'use strict';

    angular.module('deliveryApp.admin').service('AdminService', AdminService);

    AdminService.$inject = ['ApiService', 'StorageService', '$q'];
    function AdminService(ApiService, StorageService, $q) {
        var RESTAURANT_KEY = 'adm_restaurant_id';

        // ------------------------------------------------------------------
        // Context helpers
        // ------------------------------------------------------------------
        function rid() {
            return StorageService.get(RESTAURANT_KEY, null);
        }

        function base(path) {
            return '/restaurant/' + rid() + (path || '');
        }

        this.getRestaurantId = rid;

        this.setRestaurantId = function (id) {
            StorageService.set(RESTAURANT_KEY, id);
        };

        this.clearRestaurantId = function () {
            StorageService.remove(RESTAURANT_KEY);
        };

        // ------------------------------------------------------------------
        // My restaurants  GET /restaurant
        // ------------------------------------------------------------------
        this.getMyRestaurants = function () {
            return ApiService.get('/restaurant').then(function (res) {
                return res.data.data || [];
            });
        };

        // ------------------------------------------------------------------
        // Dashboard
        // ------------------------------------------------------------------
        this.getDashboardSummary = function () {
            return ApiService.get(base('/dashboard/summary')).then(function (res) {
                return res.data.data || {};
            });
        };

        this.getOrdersStats = function (params) {
            return ApiService.get(base('/dashboard/orders-stats'), params).then(function (res) {
                return res.data.data || {};
            });
        };

        this.getTopProducts = function (params) {
            return ApiService.get(base('/dashboard/top-products'), params).then(function (res) {
                return res.data.data || [];
            });
        };

        // ------------------------------------------------------------------
        // Orders
        // ------------------------------------------------------------------
        this.getOrders = function (params) {
            return ApiService.get(base('/orders'), params).then(function (res) {
                return res.data || {};
            });
        };

        this.getOrder = function (orderId) {
            return ApiService.get(base('/orders/' + orderId)).then(function (res) {
                return res.data.data || {};
            });
        };

        this.updateOrderStatus = function (orderId, status) {
            return ApiService.patch(base('/orders/' + orderId + '/status'), { status: status }).then(function (res) {
                return res.data.data || {};
            });
        };

        this.getOrderItems = function (orderId) {
            return ApiService.get(base('/orders/' + orderId + '/items')).then(function (res) {
                return res.data.data || [];
            });
        };

        // ------------------------------------------------------------------
        // Products
        // ------------------------------------------------------------------
        this.getProducts = function (params) {
            return ApiService.get(base('/products'), params).then(function (res) {
                return res.data || {};
            });
        };

        this.getProduct = function (productId) {
            return ApiService.get(base('/products/' + productId)).then(function (res) {
                return res.data.data || {};
            });
        };

        this.createProduct = function (data) {
            return ApiService.post(base('/products'), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.updateProduct = function (productId, data) {
            return ApiService.put(base('/products/' + productId), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.deleteProduct = function (productId) {
            return ApiService.delete(base('/products/' + productId));
        };

        this.toggleProductStatus = function (productId) {
            return ApiService.patch(base('/products/' + productId + '/status')).then(function (res) {
                return res.data.data || {};
            });
        };

        this.updateProductStock = function (productId, data) {
            return ApiService.patch(base('/products/' + productId + '/stock'), data).then(function (res) {
                return res.data.data || {};
            });
        };

        // ------------------------------------------------------------------
        // Categories
        // ------------------------------------------------------------------
        this.getCategories = function () {
            return ApiService.get(base('/categories')).then(function (res) {
                return res.data.data || [];
            });
        };

        this.createCategory = function (data) {
            return ApiService.post(base('/categories'), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.updateCategory = function (categoryId, data) {
            return ApiService.put(base('/categories/' + categoryId), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.deleteCategory = function (categoryId) {
            return ApiService.delete(base('/categories/' + categoryId));
        };

        this.reorderCategories = function (ids) {
            return ApiService.patch(base('/categories/reorder'), { ids: ids }).then(function (res) {
                return res.data.data;
            });
        };

        // ------------------------------------------------------------------
        // Addons
        // ------------------------------------------------------------------
        this.getAddonGroups = function () {
            return ApiService.get(base('/addons')).then(function (res) {
                return res.data.data || [];
            });
        };

        // ------------------------------------------------------------------
        // Coupons
        // ------------------------------------------------------------------
        this.getCoupons = function (params) {
            return ApiService.get(base('/coupons'), params).then(function (res) {
                return res.data || {};
            });
        };

        this.getCoupon = function (couponId) {
            return ApiService.get(base('/coupons/' + couponId)).then(function (res) {
                return res.data.data || {};
            });
        };

        this.createCoupon = function (data) {
            return ApiService.post(base('/coupons'), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.updateCoupon = function (couponId, data) {
            return ApiService.put(base('/coupons/' + couponId), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.deleteCoupon = function (couponId) {
            return ApiService.delete(base('/coupons/' + couponId));
        };

        this.toggleCouponStatus = function (couponId) {
            return ApiService.patch(base('/coupons/' + couponId + '/status')).then(function (res) {
                return res.data.data || {};
            });
        };

        this.getCouponRedemptions = function (couponId) {
            return ApiService.get(base('/coupons/' + couponId + '/redemptions')).then(function (res) {
                return res.data.data || [];
            });
        };

        // ------------------------------------------------------------------
        // Profile / Settings
        // ------------------------------------------------------------------
        this.getProfile = function () {
            return ApiService.get(base('/profile')).then(function (res) {
                return res.data.data || {};
            });
        };

        this.updateProfile = function (data) {
            return ApiService.put(base('/profile'), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.toggleRestaurantStatus = function () {
            return ApiService.patch(base('/profile/status')).then(function (res) {
                return res.data.data || {};
            });
        };

        // ------------------------------------------------------------------
        // Hours
        // ------------------------------------------------------------------
        this.getHours = function () {
            return ApiService.get(base('/hours')).then(function (res) {
                return res.data.data || [];
            });
        };

        this.bulkUpdateHours = function (hours) {
            return ApiService.put(base('/hours'), { hours: hours }).then(function (res) {
                return res.data.data;
            });
        };

        // ------------------------------------------------------------------
        // Delivery zones
        // ------------------------------------------------------------------
        this.getDeliveryZones = function () {
            return ApiService.get(base('/delivery-zones')).then(function (res) {
                return res.data.data || [];
            });
        };

        // ------------------------------------------------------------------
        // Team
        // ------------------------------------------------------------------
        this.getTeam = function () {
            return ApiService.get(base('/team')).then(function (res) {
                return res.data.data || [];
            });
        };

        this.inviteTeamMember = function (data) {
            return ApiService.post(base('/team'), data).then(function (res) {
                return res.data.data || {};
            });
        };

        this.updateTeamMemberRole = function (memberId, role) {
            return ApiService.patch(base('/team/' + memberId + '/role'), { role: role }).then(function (res) {
                return res.data.data || {};
            });
        };

        this.removeTeamMember = function (memberId) {
            return ApiService.delete(base('/team/' + memberId));
        };
    }
})();
