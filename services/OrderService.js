const createError = require('http-errors');
const OrderModel = require('../models/order');
const OrderItemModel = require('../models/orderItem');

module.exports = class OrderService {

  async create(data) {
    const { ref, userId, total, items } = data;

    try {

      // Instantiate new order and save
      const Order = new OrderModel({ ref, userId, total });
      if(items){
        Order.addItems(items);
      }
      const order = await Order.create();
      const orderItems = await Order.createItems();
      order.items = orderItems;
      return order;

    } catch(err) {
      throw err;
    }

  }

  async updateOrderByRef(ref, data) {
    try {
      // Remove cart item by line ID
      const order = await OrderModel.updateByRef(ref, data);
      return order;
    } catch(err) {
      throw err;
    }
  }

  async list(userId) {
    try {
      // Load user orders based on ID
      const orders = await OrderModel.findByUser(userId);
      
      return orders;

    } catch(err) {
      throw err;
    }
  }

  async findById(orderId) {
    try {
      // Load user orders based on ID
      const order = await OrderModel.findById(orderId);

      return order;

    } catch(err) {
      throw err;
    }
  }

}