exports.up = function (knex, Promise) {
	return knex.schema.createTable("sys_user", table => {
		//table.increments("id").primary()
        table.uuid("sys_id").defaultTo(knex.fn.uuid()).primary();
        table.string("username", 80)
        table.string("full_name", 100)
        table.string("email", 100)
        table.string("phone", 80)
        table.string("password", 255)
        table.boolean("is_sso").notNull().default(true)
        table.boolean("active").notNull().default(true)

        table.string("sys_created_by", 100)
		table.string("sys_updated_by", 100)
        table.datetime('sys_created_on', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.datetime('sys_updated_on', { precision: 6 }).defaultTo(knex.fn.now(6))

		//table.timestamps(true, true)
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable("sys_user")
}
