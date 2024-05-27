var app = angular.module('catsys', ['ui.router', "ngAnimate"]);


app.config(function ($stateProvider, $urlRouterProvider) {


    $stateProvider
        .state({
            name: "loja",
            url: '/loja',
            templateUrl: '/app/templates/loja.html',
            controller: "LojaController"
        })
        .state({
            name: "item",
            url: '/item/:id',
            templateUrl: '/app/templates/item.html',
            controller: "ItemController"
        })
        .state({
            name: "sacola",
            url: '/sacola',
            templateUrl: '/app/templates/sacola.html',
            controller: "SacolaController"
        })

    $urlRouterProvider.otherwise('/loja');

});

