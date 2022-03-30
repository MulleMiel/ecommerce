const { Client } = require('pg');
const { DB } = require('./config');

const samples = require('./samples/plants.json');

const tableCheckQuery = (table) => {
  return `SELECT * 
  FROM INFORMATION_SCHEMA.TABLES 
  WHERE TABLE_NAME = '${table}';`;
}

const recordsCheckQuery = (table) => {
  return `SELECT COUNT(*) 
  FROM ${table};`;
}

(async () => {

  const productsTableStmt = `
    CREATE TABLE IF NOT EXISTS products (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      name            VARCHAR(50)     NOT NULL,
      price           BIGINT          NOT NULL,
      description     TEXT            NOT NULL,
      image           TEXT
    );
  `;

  try {

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

    const db = new Client(options);

    await db.connect();
    
    const productsTable = await db.query(tableCheckQuery("products"));

    if(!productsTable.rows[0]){
      console.log("'products' table doesn't exist, creating one.");
      await db.query(productsTableStmt);
    }

    const productsRecords = await db.query(recordsCheckQuery("products"));
    const productCount = parseInt(productsRecords.rows[0].count);

    if(productCount){
      console.log(`${productCount} products in database.`);
      return;
    }

    for(const sample of samples.data.products.items) {

      const text = `
      INSERT INTO products(name, price, description, image)
      VALUES($1, $2, $3, $4)
      RETURNING *`;

      const values = [
        sample.name,
        sample.price_range.minimum_price.regular_price.value * 100, 
        sample.description.html, 
        sample.image.url
      ];

      const res = await db.query(text, values);
      console.log(`added ${res.rows[0].name} to products table.`)
    }

    await db.end();

  } catch(err) {
    console.log("ERROR CREATING ONE OR MORE TABLES: ", err);
  }

})();