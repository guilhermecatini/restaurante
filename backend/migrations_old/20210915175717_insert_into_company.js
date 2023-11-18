exports.up = function (knex) {
    return knex('company').insert([
        { name: "Catini Corporation", active: true, created_by: "admin" },
        { name: "Indústrias Mazinho", active: true, created_by: "admin" }
    ])
};

exports.down = function (knex) {
    return knex('company')
        .del()
};
