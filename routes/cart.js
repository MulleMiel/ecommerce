const express = require('express');
const router = express.Router();

const CartService = require('../services/CartService');
const CartServiceInstance = new CartService();

const { isAuthMiddleware } = require('./auth');

module.exports = (app, passport) => {

  app.use('/api/carts', isAuthMiddleware, router);

  router.get('/mine', async (req, res, next) => {
    try {
      const { id } = req.user;
      
      const cart = await CartServiceInstance.loadCart(id);

      if(!cart) return res.sendStatus(404);

      res.status(200).send(cart);

    } catch(err) {
      next(err);
    }
  });

  router.put('/mine', async (req, res, next) => {
    try {
      const { id } = req.user;
    
      const response = await CartServiceInstance.get({ id });
      res.status(200).json(response);
    } catch(err) {
      next(err);
    }
  });

  router.post('/mine', async (req, res, next) => {
    try {
      const { id } = req.user;
    
      const response = await CartServiceInstance.create({ userId: id });

      res.status(200).json(response);
    } catch(err) {
      next(err);
    }
  });

  router.post('/mine/items', async (req, res, next) => {
    try {
      const { id } = req.user;
      const data = req.body;

      if(!data.productId && isNaN(data.amount)){
        return res.status(401)
      }
    
      await CartServiceInstance.addItem(id, data);
      const cart = await CartServiceInstance.loadCart(id);

      res.status(200).json(cart);
    } catch(err) {
      next(err);
    }
  });

  router.put('/mine/items/:cartItemId', async (req, res, next) => {
    try {
      const { cartItemId } = req.params;
      const data = req.body;
    
      const response = await CartServiceInstance.updateItem(cartItemId, data);

      res.status(200).send(response);
    } catch(err) {
      next(err);
    }
  });

  router.delete('/mine/items/:cartItemId', async (req, res, next) => {
    try {
      const { cartItemId } = req.params;
    
      const response = await CartServiceInstance.removeItem(cartItemId);

      res.status(200).send(response);
    } catch(err) {
      next(err);
    }
  });

  router.post('/mine/checkout', async (req, res) => {
    const userId = req.user.id;

    const cart = await CartServiceInstance.checkout(userId);
  
    res.redirect(303, cart.paymentUrl);
  });
}