const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  cart_id: { type: String, required: true, unique: true},
  company: { type: String, required: true },
  city: { type: String, required: true },
  mosque: { type: String, required: true },
  district: { type: String, required: true },
  street: { type: String, required: true },
  selectedSize: { type: String, required: true },
  quantity: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  completed: { type: Boolean, required: true },
  status: { type: String, required: true },
  image: { type: String, nullable: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  completed_at: { type: Date, default: null, nullable: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id : {type: mongoose.Schema.Types.ObjectId, ref: 'products', required:true},
  distributer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User',nullable:true },
});

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;