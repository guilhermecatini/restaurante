exports.up = function (knex) {
    return knex('branch').insert([
        {
            id_company: 1,
            corporate_name: "Guilherme Catini Ribeiro - Eireli",
            fantasy_name: "Catini Corp - Loja 01",
            cpf: "37201614800",
            cnpj: "",
            postal_code: "13203552",
            number: "315",
            district: "Nova Cidade Jardim",
            city: "Jundiaí",
            state: "SP",
            complement: "Apartamento 13-B",
            created_by: "admin",
            active: true
        },
        {
            id_company: 2,
            corporate_name: "Indústrias Mazinho LTDA",
            fantasy_name: "Indústrias Mazinho",
            cpf: "06685985810",
            cnpj: "",
            postal_code: "13224620",
            number: "381",
            district: "Jardim Alessandra",
            city: "Várzea Paulista",
            state: "SP",
            complement: "",
            created_by: "admin",
            active: true
        }
    ])
};

exports.down = function (knex) {
    return knex('branch')
        .del()
};
