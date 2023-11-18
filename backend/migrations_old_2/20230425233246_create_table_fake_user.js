exports.up = function (knex, Promise) {
    return knex.schema.createTable("fake_user", table => {
        //table.increments("id").primary()
        table.uuid("sys_id").defaultTo(knex.fn.uuid());

        table.string("userId", 36);
        table.string("username", 255);
        table.string("email", 255);
        table.string("avatar", 255);
        table.string("password", 255);
        table.datetime("birthdate", { precision: 6 });
        table.datetime("registeredAt", { precision: 6 });
    })
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTable("fake_user")
}