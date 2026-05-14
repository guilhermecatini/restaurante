exports.up = function (knex, Promise) {
	return knex.schema.createTable("sys_user_federated_credentials", table => {
        table.uuid("sys_id").defaultTo(knex.fn.uuid());
        table.integer("user_id").unique()
        table.string("provider", 100)
        table.string("subject", 255)
        table.boolean("active").notNull().default(true)

        table.string("sys_created_by", 100)
		table.string("sys_updated_by", 100)
        table.datetime('sys_created_on', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.datetime('sys_updated_on', { precision: 6 }).defaultTo(knex.fn.now(6))
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable("sys_user_federated_credentials")
}
