const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://factba.se/topic/calendar';

const removeWhiteSpace = str => str.replace(/\s\s+/g, ' ');
let getData = html => {
  const $ = cheerio.load(html);

  data = {};

  const monthlyStats = $('.agenda-month', '#calendar_rows').text();
  const sanitizedStats = removeWhiteSpace(monthlyStats).split('\t');

  const calendarRows = $('#calendar_rows').each((i, row) => {
    const dates = $('td[class=agenda-date]').toArray();
    const today = dates[0];

    const rowspan = $(today).attr('rowspan');
    const times = $('.agenda-time, .timefirst').toArray();
    const agendaEvents = $('td[class=agenda-events]').toArray();

    const todaysTimes = times.slice(0, rowspan);
    const todaysEvents = agendaEvents.slice(0, rowspan);

    let eventList = [];
    $(todaysTimes).each((i, time) => {
      const eventTime = $(time)
        .text()
        .replace(/[\n\t\r]/g,"")
        .split(', ')
        .join();
      const todaysEvent = todaysEvents[i];
      const event = $(todaysEvent)
        .text()
        .replace(/[\n\t\r]/g,"")
        .split(', ')
        .join();

      eventList.push({ eventTime, event });
    });

    const fullDate = $(today)
      .text()
      .replace(/[\n\t\r]/g,"")
      .split(', ')
      .join();

    data['monthlyStats'] = sanitizedStats;
    data['todaysDate'] = fullDate;
    data['events'] = eventList;

    console.log(data);
  });
};

axios.get(URL)
  .then(resp => {
    getData(resp.data);
  }).catch(error => {
    console.log('ERR:', error);
  });
