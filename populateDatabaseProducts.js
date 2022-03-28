const dotenv = require('dotenv');
dotenv.config();
const { Client } = require('pg');
const { DB } = require('./config');

const samples = require('./samples/plants.json');

const tableCheckQuery = (table) => {
  return `SELECT * 
  FROM INFORMATION_SCHEMA.TABLES 
  WHERE TABLE_NAME = '${table}';`;
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
    
    const products = await db.query(tableCheckQuery("products"));
    if(!products.rows[0]){
      console.log("'products' table doesn't exist, creating one.");
      await db.query(productsTableStmt);
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
      console.log(res.rows[0])
    }

    await db.end();

  } catch(err) {
    console.log("ERROR CREATING ONE OR MORE TABLES: ", err);
  }

})();