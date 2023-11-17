app.service("SacolaService", function ($window, fakeDataService) {


    const ItemService = fakeDataService;

    //$window.localStorage.clear()


    this.sacola = {
        loja: "102030",
        total_itens: 499.99,
        entrega: 19.99,
        desconto: 19.99,
        total: 499.99,
        itens: []
    }

    this.ler_sacola = function () {
        const sacola = $window.localStorage.getItem("sacola");
        if (sacola)
            return JSON.parse(sacola);
        $window.localStorage.setItem("sacola", JSON.stringify(this.sacola));
        return this.sacola;
    }

    this.atualizar_sacola = function (sacola) {
        $window.localStorage.setItem("sacola", JSON.stringify(sacola));
    }

    this.proxima_sequencia = function () {
        let sacola = this.ler_sacola();
        let itens = sacola.itens;
        let proxima_sequencia = 1;
        if (itens.length == 0)
            return proxima_sequencia;
        for (let i = 0; i < itens.length; i++) {
            if (proxima_sequencia == itens[i].sequencia)
                proxima_sequencia++;
            else
                break;
        }
        return proxima_sequencia;
    }

    this.formatar_moeda = function (valor) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    this.adicionar_item = function (id_item, quantidade, observacao) {
        let sacola = this.ler_sacola();
        
        let item_selecionado = ItemService.buscar_por_id(id_item);

        let valor_unitario = item_selecionado.valor_unitario;
        let valor_unitario_formatado = this.formatar_moeda(valor_unitario);
        let valor_total = valor_unitario * quantidade;
        let valor_total_formatado = this.formatar_moeda(valor_total);

        item_selecionado.sequencia = this.proxima_sequencia();
        item_selecionado.quantidade = quantidade;
        item_selecionado.observacao = observacao;
        item_selecionado.valor_unitario_formatado = valor_unitario_formatado;
        item_selecionado.valor_total = valor_total;
        item_selecionado.valor_total_formatado = valor_total_formatado;

        
        /*
        item_selecionado = {
            ...ItemService.buscar_por_id(id_item),
            sequencia,
            quantidade,
            observacao,
            valor_unitario_formatado: "R$ 999,00",
            valor_total: 33.00,
            valor_total_formatado: "R$ 32.967,00",
        }
        */

        sacola.itens.push(item_selecionado);
        this.atualizar_sacola(sacola);
    }

    this.carregar_sacola = function () {
        return this.ler_sacola();
    }


});