const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: { // The user who will receive the notification
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: { // The user who triggered the notification
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['new_request', 'approved', 'denied', 'cancelled', 'returned'],
    required: true,
  },
  message: { // The display message for the notification
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: { // A URL to navigate to when the notification is clicked
    type: String,
    default: '/my-rentals'
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;