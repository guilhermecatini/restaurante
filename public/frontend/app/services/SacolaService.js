app.service("SacolaService", function ($window, fakeDataService) {

    const ItemService = fakeDataService;

    //$window.localStorage.clear()

    this.sacola = {
        loja: "102030",
        total_itens: 0,
        total_itens_formatado: "R$ 0,00",
        entrega: 0,
        entrega_formatado: "R$ 0,00",
        desconto: 0,
        desconto_formatado: "R$ 0,00",
        total: 0,
        total_formatado: "R$ 0,00",
        itens: []
    };

    this.normalizar_sacola = function (sacola_lida) {
        const sacola = {
            ...this.sacola,
            ...sacola_lida,
            itens: Array.isArray(sacola_lida?.itens) ? sacola_lida.itens : []
        };

        sacola.itens = sacola.itens.map((item, idx) => ({
            ...item,
            sequencia_item: Number(item.sequencia_item || item.sequencia || idx + 1)
        }));

        return sacola;
    };

    this.ler_sacola = function () {
        const sacola = $window.localStorage.getItem("sacola");
        if (sacola) {
            return this.normalizar_sacola(JSON.parse(sacola));
        }
        const sacola_inicial = this.normalizar_sacola(this.sacola);
        $window.localStorage.setItem("sacola", JSON.stringify(sacola_inicial));
        return sacola_inicial;
    };

    this.calcular_totais = function () {
        const sacola = this.ler_sacola();
        const itens = sacola.itens;
        let entrega = 5;
        let desconto = -10;
        let total_itens = 0;
        itens.forEach(item => {
            total_itens += item.valor_total;
        });
        sacola.total_itens = total_itens;
        sacola.total_itens_formatado = this.formatar_moeda(total_itens);
        sacola.entrega = entrega; // pensar no calculo
        sacola.entrega_formatado = this.formatar_moeda(entrega);
        sacola.desconto = desconto; // pensar no desconto
        sacola.desconto_formatado = this.formatar_moeda(desconto);
        sacola.total = total_itens + entrega + desconto;
        sacola.total_formatado = this.formatar_moeda(sacola.total);
        this.atualizar_sacola(sacola);
        return sacola;
    };

    this.atualizar_sacola = function (sacola) {
        $window.localStorage.setItem("sacola", JSON.stringify(sacola));
    };

    this.proxima_sequencia = function () {
        let sacola = this.ler_sacola();
        let itens = sacola.itens;
        let proxima_sequencia = 1;
        if (itens.length == 0)
            return proxima_sequencia;
        for (let i = 0; i < itens.length; i++) {
            if (proxima_sequencia == itens[i].sequencia_item)
                proxima_sequencia++;
            else
                break;
        }
        return proxima_sequencia;
    };

    this.formatar_moeda = function (valor) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    this.recalcular_sequencia_item = function (sacola) {
        sacola.itens.forEach((item, idx) => {
            item.sequencia_item = idx + 1;
        });
        return sacola;
    };

    this.remover_item = function (sequencia_item) {
        let sacola = this.ler_sacola();
        let aux_itens = sacola.itens.filter(f => {
            return f.sequencia_item != sequencia_item;
        });
        sacola.itens = aux_itens;
        sacola = this.recalcular_sequencia_item(sacola);
        this.atualizar_sacola(sacola);
        return this.calcular_totais();
    };

    this.adicionar_item = function (id_item, quantidade, observacao) {
        let sacola = this.ler_sacola();

        let item_base = ItemService.getItemById(id_item);
        if (!item_base || !item_base.id) {
            return null;
        }

        let item_selecionado = { ...item_base };

        let valor_unitario = item_selecionado.valor_unitario;
        let valor_unitario_formatado = this.formatar_moeda(valor_unitario);
        let valor_total = valor_unitario * quantidade;
        let valor_total_formatado = this.formatar_moeda(valor_total);

        item_selecionado.sequencia_item = this.proxima_sequencia();
        item_selecionado.quantidade = quantidade;
        item_selecionado.observacao = observacao;
        item_selecionado.valor_unitario_formatado = valor_unitario_formatado;
        item_selecionado.valor_total = valor_total;
        item_selecionado.valor_total_formatado = valor_total_formatado;
        sacola.itens.push(item_selecionado);
        this.atualizar_sacola(sacola);
        return this.calcular_totais();
    };

    this.carregar_sacola = function () {
        return this.calcular_totais();
    };


});