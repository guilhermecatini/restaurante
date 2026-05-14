exports.up = function (knex) {
    return knex('item').insert([
        {
            nome: "Combo 1 - Contra Filé",
            descricao: "Arroz, feijão, bife ancho acebolado, ovo e batata frita. O bife ancho é a melhor parte do contra-filé.",
            imagem: "images/contra-file.png",
            porcao: 2,
            valor_unitario: 33.00
        },
        {
            nome: "Combo 2 - Frango",
            descricao: "Arroz, feijão, frango e batata frita.",
            imagem: "images/frango.png",
            porcao: 2,
            valor_unitario: 29.90
        },
        {
            nome: "Up Tudo",
            descricao: "Pão, hambúrger, queijo, presuto, alface, tomate, ovo, bacon e maionese.",
            imagem: "images/x-tudo.png",
            porcao: 1,
            valor_unitario: 25.90
        },
        {
            nome: "Up Dog Duplo",
            descricao: "Pão, 02 salsichas, purê de batata, catupiry, batata palha, maionese, mostarda e catchup.",
            imagem: "images/dog-especial.png",
            porcao: 1,
            valor_unitario: 20.90
        },
    ])
};

exports.down = function (knex) {
    return knex('item')
        .del()
};