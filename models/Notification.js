const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['new_request', 'approved', 'denied', 'cancelled', 'returned'],
    required: true,
  },
  message: { 
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: { 
    type: String,
    default: '/my-rentals'
  },
}, {
  timestamps: true, 
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;