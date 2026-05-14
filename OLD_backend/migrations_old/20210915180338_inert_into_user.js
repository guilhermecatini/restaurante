exports.up = function (knex) {
    return knex('user').insert([
        {
            id_branch: "1",
            full_name: "System Administrator",
            email: "adm@adm.com",
            birth_date: "1990-05-23",
            mobile_phone: "11964764134",
            username: "admin",
            password: "$2b$12$wwiUYVnjw4bz2EfY269o8eZKbFkEbJXNusuJ030GcHkJoICEH5iK2",
            active: true,
            created_by: "admin"
        },
        {
            id_branch: "1",
            full_name: "System Administrator Maziero",
            email: "mazi@mazi.com",
            birth_date: "1990-05-23",
            mobile_phone: "11545454544",
            username: "maziero",
            password: "$2b$12$wwiUYVnjw4bz2EfY269o8eZKbFkEbJXNusuJ030GcHkJoICEH5iK2",
            active: true,
            created_by: "admin"
        }
    ])
};

exports.down = function (knex) {
    return knex('user')
        .del()
};