exports.up = function (knex, Promise) {
	return knex.schema.createTable('user', table => {
		table.increments('id').primary()
		table.integer('id_branch').unsigned().references('id').inTable('branch').notNull()
		table.string('full_name', 100).notNull()
		table.string('email', 70).notNull()
		table.date('birth_date')
		table.string('mobile_phone', 25)
		table.string('username', 50).unique().notNull()
		table.string('password', 255).notNull()
		table.boolean('active').notNull()
		table.string('created_by', 100).notNull()
		table.string('updated_by', 100)
		table.timestamps(true, true)
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('user')
}
