exports.up = function (knex) {
    return knex('sacola').insert([
        {
            total_itens: 0,
            entrega: 0,
            desconto: 0,
            total: 0
        },
    ])
};

exports.down = function (knex) {
    return knex('sacola')
        .del()
};