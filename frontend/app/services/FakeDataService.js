app.service('fakeDataService', function () {


    this.getItemById = function (id) {
        let finded = {};
        const data = this.getFakeData();
        for (var i = 0; i < data.grupo_item.length; i++) {
            let grupo = data.grupo_item[i];
            if (Array.isArray(grupo.itens)) {
                for (var j = 0; j < grupo.itens.length; j++) {
                    let item = grupo.itens[j];
                    if (item.id == id) {
                        finded = item;
                        break;
                    }
                }
            }
        }
        return finded;
    }


    this.getFakeData = function () {

        return {
            // Informações da Loja
            info_loja: {
                nome: "UP Lanches",
                logotipo: "images/logo-up-lanches.png",
                aberto_ate: "23h",
                pedido_minimo: "R$ 35,00"
            },

            // Itens da Loja
            grupo_item: [
                {
                    id: "1000",
                    nome: "Refeição - Janta - Marmita Grande",
                    itens: [
                        {
                            id: "1",
                            nome: "Combo 1 - Contra Filé",
                            descricao: "Arroz, feijão, bife ancho acebolado, ovo e batata frita. O bife ancho é a melhor parte do contra-filé.",
                            porcao: "Serve até 2 pessoas",
                            imagem: "images/contra-file.png",
                            quantidade: 999,
                            valor_unitario: 33.00,
                            valor_unitario_formatado: "R$ 999,00",
                            valor_total: 33.00,
                            valor_total_formatado: "R$ 32.967,00",
                        },
                        {
                            id: "2",
                            nome: "Combo 2 - Frango",
                            descricao: `Arroz, feijão, frango e batata frita.`,
                            porcao: "Serve até 2 pessoas",
                            imagem: "images/frango.png",
                            quantidade: 1,
                            valor_unitario: 29.90,
                            valor_unitario_formatado: "R$ 29,90",
                            valor_total: 29.90,
                            valor_total_formatado: "R$ 29,90",
                        }
                    ]
                },
                {
                    id: "2000",
                    nome: "Lanches",
                    itens: [
                        {
                            id: "3",
                            nome: "Up Tudo",
                            descricao: `Pão, hambúrger, queijo, presuto, alface, tomate, ovo, bacon e maionese.`,
                            porcao: "Serve 1 pessoa",
                            imagem: "images/x-tudo.png",
                            quantidade: 1,
                            valor_unitario: 25.90,
                            valor_unitario_formatado: "R$ 25,90",
                            valor_total: 25.90,
                            valor_total_formatado: "R$ 25,90",
                        },
                        {
                            id: "4",
                            nome: "Up Dog Duplo",
                            descricao: `Pão, 02 salsichas, purê de batata, catupiry, batata palha, maionese, mostarda e catchup.`,
                            porcao: "Serve 1 pessoa",
                            imagem: "images/dog-especial.png",
                            quantidade: 1,
                            valor_unitario: 20.90,
                            valor_unitario_formatado: "R$ 20,90",
                            valor_total: 20.90,
                            valor_total_formatado: "R$ 20,90",
                        }
                    ]
                },
            ]
        }
    }



    this.getUsers = function () {
        return [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
            { id: 3, name: "Charlie" }
        ];
    };

    this.getProducts = function () {
        return [
            { id: 101, name: "Product A", price: 10 },
            { id: 102, name: "Product B", price: 20 },
            { id: 103, name: "Product C", price: 30 }
        ];
    };
});