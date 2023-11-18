exports.up = function (knex, Promise) {
	return knex.schema.createTable('branch', table => {
		table.increments('id').primary()
		table.integer('id_company').unsigned().references('id').inTable('company').notNull()
		table.string('corporate_name', 100).notNull()
		table.string('fantasy_name', 100).notNull()
		table.string('cpf', 11)
		table.string('cnpj', 14)
		table.string('postal_code', 8)
		table.string('street', 100)
		table.string('number', 10)
		table.string('district', 100)
		table.string('city', 100)
		table.string('state', 50)
		table.string('complement', 255)
		table.boolean('active').notNull()
		table.string('created_by', 100).notNull()
		table.string('updated_by', 100)
		table.timestamps(true, true)
	})
}

exports.down = function (knex, Promise) {
	return knex.schema.dropTable('branch')
}
