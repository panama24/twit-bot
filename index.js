var Twit = require('twit')
var config = require('./config.js');

var T = new Twit(config)

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
