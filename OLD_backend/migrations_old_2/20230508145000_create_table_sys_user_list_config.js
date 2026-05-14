exports.up = function (knex, Promise) {
    return knex.schema.createTable("sys_user_list_config", table => {
        //table.increments("id").primary();
        table.uuid("sys_id").defaultTo(knex.fn.uuid());
        table.uuid("user_id").references("sys_user.sys_id");
        table.string("tablename", 255);
        table.string("columns_config", 4000);
        table.string("page_limit", 20);
        table.string("sys_created_by", 100)
		table.string("sys_updated_by", 100)
        table.datetime('sys_created_on', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.datetime('sys_updated_on', { precision: 6 }).defaultTo(knex.fn.now(6))
    })
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTable("sys_user_list_config")
}