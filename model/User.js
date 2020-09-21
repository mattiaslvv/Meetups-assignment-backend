const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a user schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdMeetups: {
    type: Array,
    required: false,
    meetup: {
      type: Object,
      required: false,
    },
  },
  attendingMeetups: {
    type: Array,
    required: false,
    meetupName: {
      type: String,
      required: false,
    },
    _id: {
      type: String,
      required: false,
    },
  },
  reviewHistory: {
    type: Array,
    required: false,
    _id: {
      type: String,
      required: false,
    },
    meetupName: {
      type: String,
      required: false,
    },
    review: {
      type: String,
      required: false,
    },
  },
});

module.exports = User = mongoose.model('users', UserSchema);
