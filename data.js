const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://factba.se/topic/calendar';

const removeWhiteSpace = str => str.replace(/\s\s+/g, ' ');

let getData = html => {
  data = [];
  const $ = cheerio.load(html);
  // const monthlyStats = $('.agenda-month', '#calendar_rows').text();
  // const sanitizedMonthlyStats = removeWhiteSpace(monthlyStats).split('\t');

  const calendarRows = $('#calendar_rows').each((i, row) => {
    // const array = $('td').toArray();

    ////////////////

    const dates = $('td[class=agenda-date]').toArray();

    $(dates).each((i, date) => {
      const rowspan = Number($(date).attr('rowspan'));
      const dateObj = $(date)
        .text()
        .replace(/[\n\t\r]/g,"")
        .split(', ')
        .join();

      // grab sibling trs X rowspan

      data.push({
        date: dateObj,
        rowspan,
      });
    });
    console.log(data);
  });

  const agendaTimes = $('.agenda-time', '#calendar_rows').each((i, time) => {
    const agendaTime = $(time).text().replace(/[\n\t\r]/g,"");
    const agendaEvent = $(time).siblings('td').text().replace(/[\n\t\r]/g,"");

    // console.log('TIME:', agendaTime + '\n');
    // console.log('EVENT:', agendaEvent + '\n')
  });
};

axios.get(URL)
  .then(resp => {
    getData(resp.data);
  }).catch(error => {
    console.log('ERR:', error);
  });
