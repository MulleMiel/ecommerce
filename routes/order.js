const express = require('express');
const router = express.Router();

const OrderService = require('../services/OrderService');
const OrderServiceInstance = new OrderService();
const OrderItemModel = require('../models/orderItem');

const { isAuthMiddleware } = require('./auth')

module.exports = (app) => {

  app.use('/api/orders', isAuthMiddleware, router);

  router.get('/', async (req, res, next) => {
    try {
      const { id } = req.user;
  
      const orders = await OrderServiceInstance.list(id);
      if(!orders) return res.sendStatus(404);

      res.status(200).send(orders);
    } catch(err) {
      next(err);
    }
  });

  router.get('/:orderId', async (req, res, next) => {
    try {
      const { orderId } = req.params;
  
      const order = await OrderServiceInstance.findById(orderId);
      const orderItems = await OrderItemModel.find(orderId);
      order.items = orderItems;
      
      if(!order) return res.sendStatus(404);
      res.status(200).send(order);
    } catch(err) {
      next(err);
    }
  });
}