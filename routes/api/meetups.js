const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Meetup = require('../../model/Meetup');

/*
 * @route POST api/meetups/register
 * @route GET api/meetups/all get all meetups
 * TODO: @route GET api/meetups/nearEvents filter events with geoJSON query
 * TODO: @route GET api/meetups/filtered filter and return events
 */

router.post('/register', async (req, res) => {
  let { eventName, host, details, date, location } = req.body;
  // Check for the unique username
  await Meetup.findOne({ eventName: eventName }).then((meetup) => {
    if (meetup && !res.headersSent) {
      return res.status(400).json({
        msg: 'Event already created.',
      });
    }
  });
  // The data is valid and meetup will be registered
  if (!res.headersSent) {
    let newMeetup = new Meetup({
      eventName,
      host,
      details,
      date,
      location,
    });
    newMeetup.save().then((meetup) => {
      return res.status(201).jsonp({
        success: true,
        msg: 'Meetup is now registered.',
      });
    });
  }
});

router.get('/all', async (req, res) => {
  let allMeetups = [];
  await Meetup.find().then((meetup) => {
    allMeetups.push(meetup);
  });
  return res
    .status(200)
    .jsonp({
      success: true,
      meetups: allMeetups,
    })
    .end();
});

module.exports = router;
