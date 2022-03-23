const bcrypt = require('bcryptjs');
const UserModel = require('../models/user');
const UserModelInstance = new UserModel();

module.exports = class AuthService {

  async register(data, callback) {

    const { email } = data;

    try {
      // Check if user already exists
      const user = await UserModelInstance.findOneByEmail(email);

      // If user already exists, reject
      if (user) {
        return callback(null, false);
      }

      // Hash password for secure storage
      const encryptedPassword = await encryptPassword(data.password);
      data.password = encryptedPassword;
      data.local = true;

      // User doesn't exist, create new user record
      const newUser = await UserModelInstance.create(data);
      callback(null, newUser);
    } catch(err) {
      callback(err);
    }
  };

  async login(email, password, callback) {

    try {
      const user = await UserModelInstance.findOneByEmail(email);
      console.log(user);
      if (!user) return callback(null, false);
      const passwordMatch = await verifyPassword(user.password, password);
      if (!passwordMatch) return callback(null, false);
      callback(null, user);
    } catch (error) {
      callback(error);
    }
  };
}

async function verifyPassword(dbPassword, password) {
  const match = await bcrypt.compare(password, dbPassword);
  return match;
}

async function encryptPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt)
  return hash;
}