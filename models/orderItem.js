const db = require('../db');
const moment = require('moment');
const pgp = require('pg-promise')({ capSQL: true });

module.exports = class OrderItemModel {

  constructor(data = {}) {
    this.created = data.created || moment.utc().toISOString();
    this.description = data.description;
    this.name = data.name;
    this.price = data.price || 0;
    this.productid = data.id;
    this.qty = data.qty || 1;
    this.orderid = data.orderid || null;
  }

  /**
   * Creates a new order item
   * @param  {Object}      data [Order item data]
   * @return {Object|null}      [Created order item]
   */
  static async create(data) {
    try {

      // Generate SQL statement - using helper for dynamic parameter injection
      const statement = pgp.helpers.insert(data || this, null, 'orderitems') + 'RETURNING *';
 
      // Execute SQL statment
      const result = await db.query(statement);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;

    } catch(err) {
      throw new Error(err);
    }
  }

  /**
   * Retrieve order items for an order
   * @param  {Object} orderId [Order ID]
   * @return {Array}          [Created cart item]
   */
  static async find(orderId) {
    try {

      // Generate SQL statement
      const statement = `SELECT 
                            oi.qty,
                            oi.id, 
                            p.id AS "productid",
                            p.*
                         FROM "orderitems" oi
                         INNER JOIN products p ON p.id = oi."productid"
                         WHERE "orderid" = $1`
      const values = [orderId];
  
      // Execute SQL statment
      const result = await db.query(statement, values);

      if (result.rows?.length) {
        return result.rows;
      }

      return [];

    } catch(err) {
      throw new Error(err);
    }
  }

}