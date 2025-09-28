const mongoose = require('mongoose');

const DIS_REQUEST_SCHEMa = new mongoose.Schema({
  city: { type: String, required: true },
  district: { type: String, required: true },
  drive_licence_number: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const dis_requests = mongoose.model('Distributers_request', DIS_REQUEST_SCHEMa);

module.exports = dis_requests;