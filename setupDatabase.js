const dotenv = require('dotenv');
dotenv.config();
const { Client } = require('pg');
const { DB } = require('./config');

const tableCheckQuery = (table) => {
  return `SELECT * 
  FROM INFORMATION_SCHEMA.TABLES 
  WHERE TABLE_NAME = '${table}';`;
}

(async () => {

  const usersTableStmt = `
    CREATE TABLE IF NOT EXISTS users (
      id              INT               PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      email           VARCHAR(50),      
      password        TEXT,
      firstName       VARCHAR(50),
      lastName        VARCHAR(50),
      local           BOOLEAN,
      google          BOOLEAN,
      facebook        BOOLEAN
    );
  `;

  const productsTableStmt = `
    CREATE TABLE IF NOT EXISTS products (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      name            VARCHAR(50)     NOT NULL,
      price           BIGINT          NOT NULL,
      description     TEXT            NOT NULL,
      image           TEXT
    );
  `;

  const ordersTableStmt = `
    CREATE TABLE IF NOT EXISTS orders (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      total           INT             NOT NULL,
      status          VARCHAR(50)     NOT NULL,
      userid          INT             NOT NULL,
      created         DATE            NOT NULL,
      modified        DATE            NOT NULL,
      FOREIGN KEY (userid) REFERENCES users(id)
    );
  `;

  const orderItemsTableStmt = `
    CREATE TABLE IF NOT EXISTS orderItems (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      created         DATE            NOT NULL,
      orderid         INT             NOT NULL,
      qty             INT             NOT NULL,
      price           INT             NOT NULL,
      productid       INT             NOT NULL,
      name            VARCHAR(50)     NOT NULL,
      description     TEXT            NOT NULL,
      FOREIGN KEY (orderid) REFERENCES orders(id)
    );
  `;

  const cartsTableStmt = `
    CREATE TABLE IF NOT EXISTS carts (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      userid          INT             NOT NULL,
      modified        DATE            NOT NULL,
      created         DATE            NOT NULL,
      FOREIGN KEY (userid) REFERENCES users(id),
      converted       BOOLEAN         NOT NULL,
      isactive        BOOLEAN         NOT NULL
    );
  `;

  const cartItemsTableStmt = `
    CREATE TABLE IF NOT EXISTS cartItems (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL,
      cartId          INT             NOT NULL,
      productId       INT             NOT NULL,
      qty             INT             NOT NULL,
      FOREIGN KEY (cartId) REFERENCES carts(id),
      FOREIGN KEY (productId) REFERENCES products(id)
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

    // Create tables on database
    const users = await db.query(tableCheckQuery("users"));
    if(!users.rows[0]){
      console.log("'users' table doesn't exist, creating one.");
      await db.query(usersTableStmt);
    }
    
    const products = await db.query(tableCheckQuery("products"));
    if(!products.rows[0]){
      console.log("'products' table doesn't exist, creating one.");
      await db.query(productsTableStmt);
    }

    const orders = await db.query(tableCheckQuery("orders"));
    if(!orders.rows[0]){
      console.log("'orders' table doesn't exist, creating one.");
      await db.query(ordersTableStmt);
    }

    const orderItems = await db.query(tableCheckQuery("orderItems"));
    if(!orderItems.rows[0]){
      console.log("'orderItems' table doesn't exist, creating one.");
      await db.query(orderItemsTableStmt);
    }

    const carts = await db.query(tableCheckQuery("carts"));
    if(!carts.rows[0]){
      console.log("'carts' table doesn't exist, creating one.");
      await db.query(cartsTableStmt);
    }

    const cartItems = await db.query(tableCheckQuery("cartItems"));
    if(!cartItems.rows[0]){
      console.log("'cartItems' table doesn't exist, creating one.");
      await db.query(cartItemsTableStmt);
    }

    await db.end();

  } catch(err) {
    console.log("ERROR CREATING ONE OR MORE TABLES: ", err);
  }

})();