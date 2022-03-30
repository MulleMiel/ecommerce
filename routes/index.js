const authRouter = require('./auth');
const cartRouter = require('./cart');
const orderRouter = require('./order');
const productRouter = require('./product');
const userRouter = require('./user');
const stripeRouter = require('./stripe');

module.exports = (app, passport) => {
  authRouter(app, passport);
  cartRouter(app);
  orderRouter(app);
  productRouter(app);
  userRouter(app);
  stripeRouter(app);
}