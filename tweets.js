const Twit = require('twit')
const config = require('./config.js');
const T = new Twit(config)

var options = {
  screen_name: 'realDonaldTrump',
  count: 10,
};

const getTweets = () => {
  const promise = new Promise((resolve, reject) => {
    T.get('statuses/user_timeline', options, (err, data, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  return promise;
};


// setInterval(() => {
  // getTweets()
// }, 60000);

module.exports = {
  getTweets,
};

