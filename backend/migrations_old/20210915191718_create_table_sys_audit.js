exports.up = function (knex, Promise) {
	return knex.schema.createTable('sys_audit', table => {
		table.increments('id').primary()
		table.integer('id_branch').unsigned().references('id').inTable('branch').notNull()
		table.string('tablename', 100).notNull()
		table.json('old_value').notNull()
		table.json('new_value').notNull()
		table.string('created_by', 100).notNull()
		table.timestamps(true, true)
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('sys_audit')
}
