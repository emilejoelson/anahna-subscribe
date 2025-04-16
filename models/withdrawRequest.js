const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawRequestSchema = new Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  requestAmount: {
    type: Number,
    required: true
  },
  rider: {
    type: Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['REQUESTED', 'APPROVED', 'DECLINED', 'PROCESSED']
  },
  requestTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);
