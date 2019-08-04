const axios = require('axios');
const cheerio = require('cheerio');
const getTweets = require('./index.js').getTweets;

const addZeroIfSingleDigit = require('./helpers.js').addZeroIfSingleDigit;
const getDateObject = require('./helpers.js').getDateObject;
const monthIndex = require('./helpers.js').monthIndex;
const sanitizeText = require('./helpers.js').sanitizeText;
const strip = require('./helpers.js').strip;

const URL = 'https://factba.se/topic/calendar';

const buildMonthlyStats = ($, dataObj) => {
  const monthlyStats = $('.agenda-month', '#calendar_rows').text();

  strip(monthlyStats).map(stat => {
    const [key, value] = stat.split(': ');

    if (key.includes('Tweet')) {
      dataObj['numberOfTweets'] = value;
    };
    if (key.includes('Golf')) {
      dataObj['daysOfGolf'] = value;
    };
    if (key.includes('Property')) {
      dataObj['daysOnTrumpProperty'] = value;
    };
  }).filter(Boolean);
};


const buildEventList = (
  $,
  eventList,
  eventTimesOfTheDay,
  eventsOfTheDay,
) => (
  $(eventTimesOfTheDay).each((i, time) => {
    let tweetEventThreshold;
    let timeOfEvent = $(time).find('p').text();

    if (!!timeOfEvent) {
      const nbsp = String.fromCharCode(160);
      const [time, modifier] = timeOfEvent.split(nbsp);
      let [hrs, mins] = time.split(':');

      if (hrs === '12') {
        hrs = '00';
      }
      if (modifier === 'PM') {
        hrs = parseInt(hrs, 10) + 12;
      }
      timeOfEvent = `${hrs}:${mins}`;
      tweetEventThreshold = `${Number(hrs) + 1}:${mins}`;
    };

    eventList.push({
      timeOfEventOn24HrClock: timeOfEvent,
      event: sanitizeText($(eventsOfTheDay[i])),
      tweetEventThreshold: tweetEventThreshold || '',
    });
  })
);


let getData = html => {
  const $ = cheerio.load(html);
  let data = {};
  let eventList = [];

  buildMonthlyStats($, data);

  const allAgendaDates = $('td[class=agenda-date]').toArray();
  const today = allAgendaDates[0];
  const fullDate = sanitizeText($(today));
  const dateObject = getDateObject(fullDate);

  const eventCount = $(today).attr('rowspan');
  const eventTimesOfTheDay = $('.agenda-time, .timefirst')
    .toArray()
    .slice(0, eventCount);

  const eventsOfTheDay = $('td[class=agenda-events]')
    .toArray()
    .slice(0, eventCount);

  buildEventList(
    $,
    eventList,
    eventTimesOfTheDay,
    eventsOfTheDay,
  );

  // probably want to send cal data to tweet file since the ultimate goal is to make a tweet
  getTweets().then(tweets => {
    // reduce???
    const tweetsFromToday = tweets.filter(tweet => {
      const tweetedAt = new Date(tweet.created_at);
      const { day, month, year } = dateObject;
      const today = new Date(year, month, day);

      return tweetedAt.getFullYear() === today.getFullYear() &&
      tweetedAt.getMonth() === today.getMonth() &&
      tweetedAt.getDate() === today.getDate();
    });

    // reduce??
    const replyObject = tweetsFromToday.map(tweet => {
      const tweetedAt = new Date(tweet.created_at);
      const tweetHour = `${tweetedAt.getHours()}:00`;

      const scheduledEvent = eventList.filter(({
        timeOfEventOn24HrClock,
        tweetEventThreshold,
      }) =>
        tweetHour <= tweetEventThreshold &&
        tweetHour >= timeOfEventOn24HrClock
      );

      return !!scheduledEvent.length && {
        event: scheduledEvent[0].event,
        tweet: tweet.text,
      };
    }).filter(Boolean);

    if (!!replyObject.length) {
      return;
    }

    console.log(replyObject);
    // constructTweet()
  });
  return data;
};

axios.get(URL)
  .then(resp => {
    getData(resp.data);
  }).catch(error => {
    console.log('ERR:', error);
  });
