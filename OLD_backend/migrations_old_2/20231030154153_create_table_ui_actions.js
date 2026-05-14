exports.up = function (knex, Promise) {
    return knex.schema.createTable("sys_ui_action", table => {
        //table.increments("id").primary();
        table.uuid("sys_id").defaultTo(knex.fn.uuid());
        table.string("tablename", 100);
        table.string("type", 255);
        table.string("name", 255);
        table.string("script", 8000);
        table.boolean("active");


        table.string("sys_created_by", 100)
		table.string("sys_updated_by", 100)
        table.datetime('sys_created_on', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.datetime('sys_updated_on', { precision: 6 }).defaultTo(knex.fn.now(6))
    })
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTable("sys_ui_action")
}