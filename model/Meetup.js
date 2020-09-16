const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a meetup schema
const meetupSchema = new Schema({
  name: {
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
  location: {
    type: String,
    required: false,
  },
  attendees: {
    type: Array,
    required: true,
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
});

module.exports = User = mongoose.model('meetups', meetupSchema);
