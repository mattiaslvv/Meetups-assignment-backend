//***********************/
//*** IMPORT MODULES ***/
//*********************/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');

// Initialize app
const app = express();

// Define middlewares
// Form data middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
// JSON Body middleware
app.use(bodyParser.json());
// Cors middleware
app.use(cors());
// TODO: check if this is needed. static path not necessary for this server.
app.use(express.static(path.join(__dirname, 'public')));

// Use the passport middleware
app.use(passport.initialize());
// Bring in the strategy for our Passport
require('./config/passport')(passport);

// Bring in the Database config and connect with the MongoDB database
const meetups_db = require('./config/keys').mongoURI;
mongoose
  .connect(meetups_db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`Database meetups_db connected successfully!`);
  })
  .catch((err) => {
    console.log(`Unable to connect to the database ${err}`);
  });

const users = require('./routes/api/users');
app.use('/api/users', users);

const meetups = require('./routes/api/meetups');
app.use('/api/meetups', meetups);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
