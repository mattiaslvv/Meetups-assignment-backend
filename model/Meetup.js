const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a meetup schema
const meetupSchema = new Schema({
  eventName: {
    type: String,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  attendees: {
    type: {
      type: [Array],
      required: false,
    },
    username: {
      type: String,
      required: false,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  location: {
    //** USE GEOLOCATION ON FRONT END WHEN CREATING MEETUP **/
    type: {
      type: String,
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
    },
    //** !!!LONGITUDE COMES FIRST; THEN LATITUDE!!! **/
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  reviews: {
    type: {
      type: Array,
      required: false,
    },
    review: {
      type: Object,
      required: false,
    },
  },
});

module.exports = User = mongoose.model('meetups', meetupSchema);
