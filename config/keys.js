require('dotenv').config();
//FIXME: change login to client
let uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@meetup-assignment.plsdh.mongodb.net/meetups_db?retryWrites=true&w=majority`;

module.exports = {
  mongoURI: uri,
  secret: 'authorization secret',
};
