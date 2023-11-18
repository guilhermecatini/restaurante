const config = require('../../knexfile')
const knex = require('knex')(JSON.parse(JSON.stringify(config)));


// knex.migrate.latest([config]) // caso queira que as migrations sejam executadas automaticamente
module.exports = knex
