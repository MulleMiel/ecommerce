const stripe = require('stripe')('sk_test_51KinN5FE9MWQrk5ln7ARlBFfvNhzU7ZJRBcjqcDW9xPt7FfslNW1gEphCf93X01LhPNJPzarzAs4BQOqWu2egTdq001D7WvkkE');
const express = require('express');
const router = express.Router();

const CartService = require('../services/CartService');
const CartServiceInstance = new CartService();
const CartItemModel = require('../models/cartItem')

const OrderService = require('../services/OrderService');
const OrderServiceInstance = new OrderService();
const OrderModel = require('../models/order');
const OrderItem = require('../models/orderItem');

const { isAuthMiddleware } = require('./auth')

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

  // router.post('/mine/checkout', async (req, res, next) => {
  //   try {
  //     const { id } = req.user;

  //     const { cartId, paymentInfo } = req.body; 

  //     const response = await CartServiceInstance.checkout(cartId, id, paymentInfo);

  //     res.status(200).send(response);
  //   } catch(err) {
  //     next(err);
  //   }
  // });

  const FRONTEND_DOMAIN = "http://localhost:3000";

  router.post('/mine/checkout', async (req, res) => {
    const userId = req.user.id;
    const { cartId } = req.body; 

    // Load cart items
    //const cart = await CartServiceInstance.loadCart(userId);
    const cartItems = await CartItemModel.find(cartId);

    // Generate total price from cart items
    const total = cartItems.reduce((total, item) => {
      return total += Number(item.price) * item.qty;
    }, 0);

    // Generate initial order
    const Order = new OrderModel({ total, userId });
    Order.addItems(cartItems);
    const OrderRecord = await Order.create();

    const line_items = [];

    for(const orderItem of Order.items) {
      orderItem.orderid = OrderRecord.id;
      await OrderItem.create(orderItem);

      const product = await stripe.products.create({
        name: orderItem.name,
        images: [orderItem.image]
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: orderItem.price,
        currency: 'eur',
      });

      line_items.push({
        price: price.id,
        quantity: orderItem.qty
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${FRONTEND_DOMAIN}/payment?success=true`,
      cancel_url: `${FRONTEND_DOMAIN}/payment?canceled=true`,
    });
  
    res.redirect(303, session.url);
    //res.redirect(303, "/test");
  });
}