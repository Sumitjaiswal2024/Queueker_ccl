const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  queueId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  tokenNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'done', 'skipped'],
    default: 'waiting'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', tokenSchema);