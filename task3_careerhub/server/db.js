// One shared connection pool for the whole server
require('dotenv').config();
const { Pool } = require('pg');

module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
