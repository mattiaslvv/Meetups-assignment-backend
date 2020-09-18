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
  let {
    eventName,
    host,
    details,
    attendees,
    date,
    address,
    location,
    reviews,
  } = req.body;
  // Check for the unique username
  await Meetup.findOne({ eventName: eventName }).then((meetup) => {
    if (meetup && !res.headersSent) {
      return res.status(400).json({
        success: false,
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
      attendees,
      date,
      address,
      location,
      reviews,
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
    allMeetups = meetup;
  });
  return res
    .status(200)
    .jsonp({
      success: true,
      meetups: allMeetups,
    })
    .end();
});

router.get('/my-meetups', async (req, res) => {
  let hostedMeetups = [];
  let { name } = req.body; //Hostname is sent with the get request
  await Meetup.find({ host: name }).then((meetup) => {
    hostedMeetups = meetup;
  });
  return res
    .status(200)
    .jsonp({
      success: true,
      meetups: hostedMeetups,
    })
    .end();
});

router.get('/reviews', async (req, res) => {
  let reviewedMeetups = [];
  let { username } = req.body; //Username is sent with the get request
  await Meetup.find({ 'reviews.username': username }).then((meetup) => {
    reviewedMeetups = meetup;
  });
  return res
    .status(200)
    .jsonp({
      success: true,
      meetups: reviewedMeetups,
    })
    .end();
});

//TODO: see if posting review works so it adds to exact meetups reviews.
router.post('/review', async (req, res) => {
  let reviewedMeetups = [];
  let _id = req.body._id;
  let review = {};
  review = { username: req.body.review.username, text: req.body.review.text };
  // Check if review by that user already exists on the meetup
  await Meetup.findOne({ _id: _id, 'reviews.username': review.username }).then(
    (meetup) => {
      if (meetup && !res.headersSent) {
        return res
          .status(400)
          .jsonp({
            success: false,
            msg: 'You already have a review on this meetup',
          })
          .end();
      }
    }
  );
  //Username and Text(review) is sent with the get request along with the _id of the meetup
  if (res.headersSent == false) {
    await Meetup.findOneAndUpdate(
      { _id: _id },
      { $push: { reviews: review } }
    ).then((meetup) => {
      reviewedMeetups = meetup;
    });
    return res
      .status(200)
      .jsonp({
        success: true,
        meetups: reviewedMeetups,
      })
      .end();
  }
});

module.exports = router;
