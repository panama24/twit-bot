const axios = require('axios');
const cheerio = require('cheerio');
const getTweets = require('./index.js').getTweets;

const addZeroIfSingleDigit = require('./helpers.js').addZeroIfSingleDigit;
const getDateObject = require('./helpers.js').getDateObject;
const monthIndex = require('./helpers.js').monthIndex;
const sanitizeText = require('./helpers.js').sanitizeText;
const stripStr = require('./helpers.js').stripStr;

const URL = 'https://factba.se/topic/calendar';

let getData = html => {
  const $ = cheerio.load(html);

  data = {};

  const agendaMonthStats = $('.agenda-month', '#calendar_rows').text();
  const stats = stripStr(agendaMonthStats);

  stats.map(str => {
    const stat = str.split(': ');
    if (stat[0].includes('Tweet')) {
      data['numberOfTweets'] = stat[1];
    };
    if (stat[0].includes('Golf')) {
      data['daysOfGolf'] = stat[1];
    };
    if (stat[0].includes('Property')) {
      data['daysOnTrumpProperty'] = stat[1];
    };
  }).filter(Boolean);

  // today's date
  const allAgendaDates = $('td[class=agenda-date]').toArray();
  const today = allAgendaDates[0];

  // use today's date to get date obj
  const fullDate = sanitizeText($(today));
  const dateObject = getDateObject(fullDate);

  // number of events today
  const numberOfDailyEvents = $(today).attr('rowspan');

  // times of today's events
  const eventTimes = $('.agenda-time, .timefirst').toArray();
  const timesOfTodaysEvents = eventTimes.slice(0, numberOfDailyEvents);

  // all events
  const allAgendaEvents = $('td[class=agenda-events]').toArray();
  const todaysEvents = allAgendaEvents.slice(0, numberOfDailyEvents);

  // create a list of today's events: [{ time, event }];
  let eventList = [];
  $(timesOfTodaysEvents).each((i, time) => {
    let tweetThreshold;
    let eventTime = $(time).find('p').text();

    if (!!eventTime) {
      const nbsp = String.fromCharCode(160);
      const [timeStr, modifier] = eventTime.split(nbsp);
      let [hours, minutes] = timeStr.split(':');
      if (hours === '12') {
        hours = '00';
      }

      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }

      eventTime = `${hours}:${minutes}`;
      tweetThreshold = `${Number(hours) + 12}:${minutes}`;
    };

    const todaysEvent = todaysEvents[i];
    const event = sanitizeText($(todaysEvent));

    eventList.push({
      militaryEventTime: eventTime,
      event,
      tweetThreshold: tweetThreshold || '',
    });
  });

  data['events'] = eventList;

  // probably want to send cal data to tweet file since the ultimate goal is to make a tweet
  getTweets().then(tweets => {
    // reduce???
    const tweetedToday = tweets.filter(tweet => {
      const createdAt = new Date(tweet.created_at);
      const today = new Date(dateObject.year, dateObject.month, dateObject.day);

      return createdAt.getFullYear() === today.getFullYear() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getDate() === today.getDate();
    });

    // reduce??
    const replies = tweetedToday.map(tweet => {
      const createdAt = new Date(tweet.created_at);
      const tweetHour = `${createdAt.getHours()}:00`;

      const scheduledEvent = eventList.filter(({
        militaryEventTime,
        tweetThreshold,
      }) =>
        tweetHour <= tweetThreshold &&
        tweetHour >= militaryEventTime
      );

      return !!scheduledEvent.length && {
        event: scheduledEvent[0].event,
        tweet: tweet.text,
      };
    }).filter(Boolean);

    console.log(replies);
    // handle no events
  });



  // console.log(data)
  return data;
};

axios.get(URL)
  .then(resp => {
    getData(resp.data);
  }).catch(error => {
    console.log('ERR:', error);
  });
