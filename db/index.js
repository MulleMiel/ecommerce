"use strict";

const { Pool } = require('pg');
const { DB } = require('../config');

let options = {
  user: DB.PGUSER,
  host: DB.PGHOST,
  database: DB.PGDATABASE,
  password: DB.PGPASSWORD,
  port: parseInt(DB.PGPORT)
}

if(DB.URL) options = {
  connectionString: DB.URL + "?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
}

const pool = new Pool(options);

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
  pool.end()
});

module.exports = {
  query: (text, params) => pool.query(text, params)
}