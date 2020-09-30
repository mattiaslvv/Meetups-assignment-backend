const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Meetup = require('../../model/Meetup');
const User = require('../../model/User');
require('dotenv').config();

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
    time,
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
      time,
      date,
      address,
      location,
      reviews,
    });
    await User.findOneAndUpdate(
      { name: host },
      { $push: { createdMeetups: newMeetup } }
    );
    newMeetup.save().then((meetup) => {
      return res.status(201).jsonp({
        success: true,
        meetup: meetup,
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

router.post('/review', async (req, res) => {
  let reviewedMeetups;
  let _id = req.body._id;
  let review = {
    username: req.body.username,
    text: req.body.text,
  };
  if (review.text == '' || review.text == null) {
    return res
      .status(400)
      .jsonp({
        success: false,
        msg:
          'Your review was empty. Make sure to type your review before sending it.',
      })
      .end();
  }
  if (res.headersSent == false) {
    // Check if review by that user already exists on the meetup
    await Meetup.findOne({
      _id: _id,
      'reviews.username': review.username,
    }).then((meetup) => {
      if (meetup && !res.headersSent) {
        return res
          .status(400)
          .jsonp({
            success: false,
            msg: 'You already have a review on this meetup',
          })
          .end();
      }
    });
  }
  //Username and Text(review) is sent with the get request along with the _id of the meetup
  if (res.headersSent == false) {
    await Meetup.findOneAndUpdate(
      { _id: _id },
      { $push: { reviews: review } }
    ).then((meetup) => {
      reviewedMeetups = meetup;
    });
    await User.findOneAndUpdate(
      { username: review.username },
      {
        $push: {
          reviewHistory: {
            _id: _id,
            meetupName: reviewedMeetups.eventName,
            review: review.text,
          },
        },
      }
    );
    return res
      .status(200)
      .jsonp({
        success: true,
        meetups: reviewedMeetups,
        msg: 'Successfully reviewed meetup',
      })
      .end();
  }
});

router.put('/review', async (req, res) => {
  let reviewedMeetup;
  let _id = req.body._id;
  let review = {
    username: req.body.username,
    text: '',
  };
  await Meetup.findOne({ _id: _id })
    .then((meetup) => {
      reviewedMeetup = meetup;
      let foundReview = meetup.reviews.find(
        (item) => item.username == review.username
      );
      review.text = foundReview.text;
    })
    .catch((err) => {
      console.log(err);
    });
  //Username and Text(review) is sent with the put request along with the _id of the meetup
  await Meetup.findOneAndUpdate({ _id: _id }, { $pull: { reviews: review } });
  await User.findOneAndUpdate(
    { username: review.username },
    {
      $pull: {
        reviewHistory: {
          _id: _id,
          meetupName: reviewedMeetup.eventName,
          review: review.text,
        },
      },
    }
  ).catch((err) => {
    console.log(err);
  });
  return res
    .status(200)
    .jsonp({
      success: true,
      meetups: reviewedMeetup,
      msg: 'Successfully removed review from meetup.',
    })
    .end();
});

router.post('/meetup', async (req, res) => {
  let filteredMeetup = [];
  let { id } = req.body; //ID is sent with the get request
  await Meetup.findOne({ _id: id })
    .then((meetup) => {
      filteredMeetup = meetup;
    })
    .catch((err) => {
      return res
        .status(400)
        .jsonp({
          success: false,
          msg: err,
        })
        .end();
    });
  if (filteredMeetup == null && res.headersSent == false) {
    return res
      .status(400)
      .jsonp({
        success: false,
        msg: 'Meetup not found',
      })
      .end();
  }
  if (filteredMeetup !== null && res.headersSent == false) {
    return res
      .status(200)
      .jsonp({
        success: true,
        meetups: filteredMeetup,
      })
      .end();
  }
});

router.post('/attend', async (req, res) => {
  let { name, id } = req.body; //Name of the user and id of meetup is sent with the api request
  let attendedMeetup = [];
  await Meetup.findOneAndUpdate({ _id: id }, { $push: { attendees: name } })
    .then((meetup) => {
      attendedMeetup = meetup;
    })
    .catch((err) => {
      return res
        .status(400)
        .jsonp({
          success: false,
          msg: err,
        })
        .end();
    });
  if (res.headersSent == false && attendedMeetup != null) {
    await User.findOneAndUpdate(
      { name: name },
      {
        $push: {
          attendingMeetups: {
            meetupName: attendedMeetup.eventName,
            _id: id,
          },
        },
      }
    );
    return res
      .status(200)
      .jsonp({
        success: true,
        msg: 'You have successfully signed up to attend this meetup.',
      })
      .end();
  }
});

router.put('/attend', async (req, res) => {
  let { name, id } = req.body; //Name of the user and id of meetup is sent with the api request
  let attendedMeetup = [];
  await Meetup.findOneAndUpdate({ _id: id }, { $pull: { attendees: name } })
    .then((meetup) => {
      attendedMeetup = meetup;
    })
    .catch((err) => {
      return res
        .status(400)
        .jsonp({
          success: false,
          msg: err,
        })
        .end();
    });
  if (res.headersSent == false && attendedMeetup != null) {
    await User.findOneAndUpdate(
      { name: name },
      {
        $pull: {
          attendingMeetups: {
            meetupName: attendedMeetup.eventName,
            _id: id,
          },
        },
      }
    );
    return res
      .status(200)
      .jsonp({
        success: true,
        msg: 'You are no longer attending this Meetup',
      })
      .end();
  }
});

router.put('/meetup/remove', async (req, res) => {
  let id = req.body.id;
  let userId = req.body.userId; //Id of meetup as well as userId is sent with the api request
  let deletedMeetup;
  await Meetup.findOneAndDelete({ _id: id })
    .then((meetup) => {
      deletedMeetup = meetup;
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .jsonp({
          success: false,
          msg: err,
        })
        .end();
    });

  if (res.headersSent == false && deletedMeetup != null) {
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          createdMeetups: {
            _id: deletedMeetup._id,
          },
        },
      }
    ).catch((err) => {
      console.log(err);
    });
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          attendingMeetups: {
            _id: id,
          },
        },
      }
    ).catch((err) => {
      console.log(err);
    });
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          reviewHistory: {
            _id: id,
          },
        },
      }
    ).catch((err) => {
      console.log(err);
    });
    return res
      .status(200)
      .jsonp({
        success: true,
        msg: 'Successfully removed Meetup',
      })
      .end();
  }
});

router.get('/api', (req, res) => {
  let token = process.env.MAPBOX_TOKEN;
  return res
    .jsonp({
      token: token,
    })
    .end();
});

module.exports = router;
