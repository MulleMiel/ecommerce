const express = require('express');
const router = express.Router();

const OrderService = require('../services/OrderService');
const OrderServiceInstance = new OrderService();
const OrderItemModel = require('../models/orderItem');

const { STRIPE } = require('../config');
const stripe = require('stripe')(STRIPE.CLIENT_SECRET);

module.exports = (app) => {

  app.use('/api/stripe', router);

  const fulfillOrder = (session) => {
    // TODO: fill me in
    console.log(`Fulfilled stripe order ref (${session.client_reference_id}) amount (${session.amount_total}) payment status (${session.payment_status})`);
  }
  
  const createOrder = (session) => {
    // TODO: fill me in
    console.log(`Created stripe order ref (${session.client_reference_id}) amount (${session.amount_total}) payment status (${session.payment_status})`);
  }
  
  const emailCustomerAboutFailedPayment = (session) => {
    // TODO: fill me in
    console.log(`Failed payment. Stripe order ref (${session.client_reference_id}). Emailing customer.`);
  }
  
  router.post('/webhook', (req, res) => {
    const payload = req.rawBody;
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(payload, sig, STRIPE.WEBHOOK_SECRET);
    } catch (err) {
      console.log(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Save an order in your database, marked as 'awaiting payment'
        createOrder(session);
  
        // Check if the order is paid (for example, from a card payment)
        //
        // A delayed notification payment will have an `unpaid` status, as
        // you're still waiting for funds to be transferred from the customer's
        // account.
        if (session.payment_status === 'paid') {
          fulfillOrder(session);
        }
  
        break;
      }
  
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
  
        // Fulfill the purchase...
        fulfillOrder(session);
  
        break;
      }
  
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
  
        // Send an email to the customer asking them to retry their order
        emailCustomerAboutFailedPayment(session);
  
        break;
      }
    }
  
    res.status(200);
  });
}