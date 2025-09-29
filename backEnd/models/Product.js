const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
  company: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: String, required: true },
  price: { type: String, required: true },
});

const Order = mongoose.model('products', productsSchema);

module.exports = Order;