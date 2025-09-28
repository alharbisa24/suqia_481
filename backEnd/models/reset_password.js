const mongoose = require('mongoose');

const resetPasswordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema);

module.exports = ResetPassword;