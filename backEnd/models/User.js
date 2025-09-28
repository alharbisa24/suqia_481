const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true ,nullable:true},
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributers_request', nullable: true },
  rank: { type: String, default: 'user' },

});

const User = mongoose.model('User', userSchema);

module.exports = User;