const express = require('express');
const router = express.Router();

const OrderService = require('../services/OrderService');
const OrderServiceInstance = new OrderService();
const CartService = require('../services/CartService');
const CartServiceInstance = new CartService();

const { STRIPE } = require('../config');
const stripe = require('stripe')(STRIPE.CLIENT_SECRET);

module.exports = (app) => {

  app.use('/api/stripe', router);
  
  const createOrder = async (session) => {
    
    const cartId = session.client_reference_id;
    const cart = await CartServiceInstance.loadCartById(cartId);

    // 2022-03-31T01:29:59.429638+00:00 app[web.1]: /app/routes/stripe.js:23
    // 2022-03-31T01:29:59.429644+00:00 app[web.1]:     await OrderServiceInstance.create({ ref: cartId, userId: cart.userid, total, items: cart.items });
    // 2022-03-31T01:29:59.429645+00:00 app[web.1]:                                                                   ^
    // 2022-03-31T01:29:59.429646+00:00 app[web.1]: 
    // 2022-03-31T01:29:59.429646+00:00 app[web.1]: TypeError: Cannot read properties of null (reading 'userid')
    // 2022-03-31T01:29:59.429647+00:00 app[web.1]:     at createOrder (/app/routes/stripe.js:23:67)
    // 2022-03-31T01:29:59.429647+00:00 app[web.1]:     at processTicksAndRejections (node:internal/process/task_queues:96:5)
    // 2022-03-31T01:29:59.429648+00:00 app[web.1]:     at async /app/routes/stripe.js:63:9
    // 2022-03-31T01:29:59.429652+00:00 app[web.1]: 
    // 2022-03-31T01:29:59.429653+00:00 app[web.1]: Node.js v17.8.0

    // Generate initial order and add to db
    await OrderServiceInstance.create({ ref: cartId, userId: cart.userid, total, items: cart.items });

    // set cart to converted since order has been created from it
    await CartServiceInstance.updateCart(cart.id, { isactive: false });

    console.log(`Created stripe order ref (${session.client_reference_id}) amount (${session.amount_total}) payment status (${session.payment_status})`);
  }

  const fulfillOrder = async (session) => {
    const cartId = session.client_reference_id;
    await CartServiceInstance.removeItems(cartId);
    await CartServiceInstance.removeCart(cartId);
    
    await OrderServiceInstance.updateOrderByRef(cartId, { status: "COMPLETE"});

    console.log(`Fulfilled stripe order ref (${session.client_reference_id}) amount (${session.amount_total}) payment status (${session.payment_status})`);
  }
  
  const emailCustomerAboutFailedPayment = async (session) => {
    // TODO: fill me in
    console.log(`Failed payment. Stripe order ref (${session.client_reference_id}). Emailing customer.`);
  }
  
  router.post('/webhook', async (req, res) => {
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
        await createOrder(session);
  
        // Check if the order is paid (for example, from a card payment)
        //
        // A delayed notification payment will have an `unpaid` status, as
        // you're still waiting for funds to be transferred from the customer's
        // account.
        if (session.payment_status === 'paid') {
          await fulfillOrder(session);
        }
  
        break;
      }
  
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
  
        // Fulfill the purchase...
        await fulfillOrder(session);
  
        break;
      }
  
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
  
        // Send an email to the customer asking them to retry their order
        await emailCustomerAboutFailedPayment(session);
  
        break;
      }
    }
  
    res.status(200);
  });
}