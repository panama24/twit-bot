const axios = require('axios');
const cheerio = require('cheerio');

const stripStr = require('./helpers.js').stripStr;
const sanitizeText = require('./helpers.js').sanitizeText;

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

  // get today's date
  const allAgendaDates = $('td[class=agenda-date]').toArray();
  const today = allAgendaDates[0];

  // all today's date to data obj
  const fullDate = sanitizeText($(today));
  data['todaysDate'] = fullDate;

  // rowspan = how many events there are today
  const numberOfDailyEvents = $(today).attr('rowspan');

  // get times for all of today's events
  const eventTimes = $('.agenda-time, .timefirst').toArray();
  const timesOfTodaysEvents = eventTimes.slice(0, numberOfDailyEvents);

  // get all events
  const allAgendaEvents = $('td[class=agenda-events]').toArray();
  // get today's events
  const todaysEvents = allAgendaEvents.slice(0, numberOfDailyEvents);

  // create a list of today's events: [{ time, event }];
  let eventList = [];
  $(timesOfTodaysEvents).each((i, time) => {
    const eventTime = sanitizeText($(time));
    const todaysEvent = todaysEvents[i];
    const event = sanitizeText($(todaysEvent));

    eventList.push({ eventTime, event });
  });

  // add events to data obj
  data['events'] = eventList;

  console.log(data);
  return data;
};

axios.get(URL)
  .then(resp => {
    getData(resp.data);
  }).catch(error => {
    console.log('ERR:', error);
  });
