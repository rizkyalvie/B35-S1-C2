const { Pool } = require('pg');

let client = new Client({
    user: "postgres",
    password: "mikalea6",
    database: "b35_personal_web",
    port: 5432,
    host: "host",
    ssl: true
});

const dbPool = new Pool({
    client
})

module.exports = dbPool