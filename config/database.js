const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/database.sqlite'),
    logging: console.log,
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/database.sqlite'),
    logging: false,
  }
}; 