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
  connectionString: DB.URL,
  ssl: { 
    rejectUnauthorized: false 
  } 
}

const pool = new Pool(options);

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  console.log("Test database connection <SELECT NOW()>:");
  if(err) console.log(err);
  if(res) console.log(res.rows[0].now);
});

module.exports = {
  query: (text, params) => pool.query(text, params)
}