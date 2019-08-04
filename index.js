const Twit = require('twit')
const config = require('./config.js');

const T = new Twit(config)

// const tweeted = () => console.log('Who cares. I tweeted.');
// T.post('statuses/update', { status: 'Uhhhhhhh...' }, tweeted);

var options = {
  screen_name: 'realDonaldTrump',
  count: 10,
};

const getTweets = () => {
  const promise = new Promise((resolve, reject) => {
    T.get('statuses/user_timeline', options, function(err, data, response) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  return promise;
};

module.exports = {
  getTweets,
};
