const { Pool } = require('pg');

const connectionString = 'postgresql://postgres:mikalea6@database.server.com:3211/b35_personal_web'

const dbPool = new Pool({
    connectionString: connectionString
})

module.exports = dbPool