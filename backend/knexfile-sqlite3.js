module.exports = {
    client: 'sqlite',
    connection: {
        filename: 'src/sqlitedb/sysdatabase.db3'
    },
    migrations: {
        tableName: 'knex_migrations'
    },
    useNullAsDefault: true
};
