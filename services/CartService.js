const createError = require('http-errors');
const CartModel = require('../models/cart');
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

  async loadCartById(cartId) {
    try {
      // Load user cart based on ID
      const cart = await CartModel.findOneById(cartId);

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

  async removeCart(cartId) {
    try {
      // Remove cart item by line ID
      const cart = await CartModel.delete(cartId);

      return cart;

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

  async removeItems(cartId) {
    try {
      // Remove cart item by line ID
      const cartItems = await CartItemModel.deleteByCartId(cartId);

      return cartItems;

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

      const line_items = [];

      // Define products and prices for payment page
      for(const cartItem of cart.items) {

        const product = await stripe.products.create({
          name: cartItem.name,
          images: [cartItem.image]
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: cartItem.price,
          currency: 'eur',
        });

        line_items.push({
          price: price.id,
          quantity: cartItem.qty
        });
      }

      const session = await stripe.checkout.sessions.create({
        client_reference_id: cart.id,
        line_items,
        mode: 'payment',
        success_url: `${FRONTEND_DOMAIN}/payment?success=true`,
        cancel_url: `${FRONTEND_DOMAIN}/payment?canceled=true`,
      });

      cart.paymentUrl = session.url;
      return cart;

    } catch(err) {
      throw err;
    }
  }

}