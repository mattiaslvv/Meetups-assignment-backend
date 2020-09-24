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
    type: Array,
    required: false,
    username: {
      type: String,
      required: false,
    },
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
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
    type: Array,
    required: false,
    review: {
      type: Object,
      required: false,
      username: {
        type: String,
        required: false,
      },
      text: {
        type: String,
        required: false,
      },
    },
  },
});

module.exports = User = mongoose.model('meetups', meetupSchema);
