require('dotenv').config();
const { Pool, types } = require('pg');

// pg returns DATE as a JS Date (timezone headaches) and NUMERIC as a string.
// Keep dates as plain 'YYYY-MM-DD' strings and numbers as numbers.
types.setTypeParser(1082, (val) => val);
types.setTypeParser(1700, (val) => parseFloat(val));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
