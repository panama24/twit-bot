var Twit = require('twit')
var config = require('./config.js');

var T = new Twit(config)

var options = {
  screen_name: 'realDonaldTrump',
  count: 10,
};

T.get('statuses/user_timeline', options, function(err, data, response) {
  return data.map(d => console.log(d.text));
});
