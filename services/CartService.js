const createError = require('http-errors');
const CartModel = require('../models/cart');
const OrderModel = require('../models/order');
const OrderItem = require('../models/orderItem');
const CartItemModel = require('../models/cartItem');

const { FRONTEND_DOMAIN, STRIPE } = require('../config');
const stripe = require('stripe')(STRIPE.CLIENT_SECRET);


module.exports = class CartService {

  async create(data) {
    const { userId } = data;

    try {

      // Instantiate new cart and save
      const Cart = new CartModel();
      const cart = await Cart.create(userId);

      return cart;

    } catch(err) {
      throw err;
    }

  };

  async loadCart(userId) {
    try {
      // Load user cart based on ID
      const cart = await CartModel.findOneByUser(userId);

      if(!cart) return null;

      // Load cart items and add them to the cart record
      const items = await CartItemModel.find(cart.id);
      cart.items = items;

      return cart;

    } catch(err) {
      throw err;
    }
  }

  async addItem(userId, item) {
    try {
      // Load user cart based on ID
      let cart = await CartModel.findOneByUser(userId);

      if(!cart){
        cart = await this.create({ userId })
      }

      const existingCartItems = await CartItemModel.find(cart.id);

      const existingCartItem = existingCartItems.find(cartItem => cartItem.productid === item.productId);

      if(existingCartItem){
        const cartItem = await CartItemModel.update(existingCartItem.cartitemid, { qty: existingCartItem.qty + item.qty });
        return cartItem;
      }

      // Create cart item
      const cartItem = await CartItemModel.create({ cartId: cart.id, ...item });
      return cartItem;

    } catch(err) {
      throw err;
    }
  }

  async removeItem(cartItemId) {
    try {
      // Remove cart item by line ID
      const cartItem = await CartItemModel.delete(cartItemId);

      return cartItem;

    } catch(err) {
      throw err;
    }
  }

  async updateItem(cartItemId, data) {
    try {
      // Remove cart item by line ID
      const cartItem = await CartItemModel.update(cartItemId, data);

      return cartItem;

    } catch(err) {
      throw err;
    }
  }

  async updateCart(cartId, data) {
    try {
      // Remove cart item by line ID
      const cart = await CartModel.update(cartId, data);
      return cart;
    } catch(err) {
      throw err;
    }
  }

  async checkout(userId) {
    try {
      const cart = await this.loadCart(userId);

      // Generate total price from cart items
      const total = cart.items.reduce((total, item) => {
        return total += Number(item.price) * item.qty;
      }, 0);

      // Generate initial order and add to db
      const Order = new OrderModel({ total, userId });
      Order.addItems(cart.items);
      const order = await Order.create();

      // set cart to converted since order has been created from it
      await this.updateCart(cart.id, { converted: true });

      const line_items = [];

      for(const orderItem of order.items) {

        // Add order items to db
        orderItem.orderid = order.id;
        await OrderItem.create(orderItem);

        // Define products and prices for payment page

        const product = await stripe.products.create({
          name: orderItem.name
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
        client_reference_id: order.id,
        line_items,
        mode: 'payment',
        success_url: `${FRONTEND_DOMAIN}/payment?success=true`,
        cancel_url: `${FRONTEND_DOMAIN}/payment?canceled=true`,
      });

      order.paymentUrl = session.url;
      return order;

    } catch(err) {
      throw err;
    }
  }

}