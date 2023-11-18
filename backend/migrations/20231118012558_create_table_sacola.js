exports.up = function (knex, Promise) {
	return knex.schema.createTable("sacola", table => {

        table.uuid("sys_id").defaultTo(knex.fn.uuid()).primary();
        table.float("total_itens", 8, 4);
        table.float("entrega", 8, 4);
        table.float("desconto", 8, 4);
        table.float("total", 8, 4);

        table.string("sys_created_by", 100)
		table.string("sys_updated_by", 100)
        table.datetime('sys_created_on', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.datetime('sys_updated_on', { precision: 6 }).defaultTo(knex.fn.now(6))

		//table.timestamps(true, true)
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable("sacola")
}
