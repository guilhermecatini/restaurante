exports.up = function (knex, Promise) {
	return knex.schema.createTable('company', table => {
		table.increments('id').primary()
		table.string('name', 50).notNull()
		table.boolean('active').notNull()
		table.string('created_by', 100).notNull()
		table.string('updated_by', 100)
		table.timestamps(true, true)
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('company')
}
