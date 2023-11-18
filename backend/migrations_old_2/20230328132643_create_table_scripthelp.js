exports.up = function (knex, Promise) {
	return knex.schema.createTable("scripthelp", table => {
        //table.increments("id").primary()
        table.uuid("sys_id").defaultTo(knex.fn.uuid());
        table.string("short_description", 255)
        table.string("description", 4000)
        table.text("script", "longtext");
        table.boolean("active").notNull().default(true)

        table.string("sys_created_by", 100)
		table.string("sys_updated_by", 100)
        table.datetime('sys_created_on', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.datetime('sys_updated_on', { precision: 6 }).defaultTo(knex.fn.now(6))
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable("scripthelp")
}
