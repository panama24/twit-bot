const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://factba.se/topic/calendar';

const removeWhiteSpace = str => str.replace(/\s\s+/g, ' ');

let getData = html => {
  data = [];
  const $ = cheerio.load(html);

  const monthlyStats = $('.agenda-month', '#calendar_rows').text();
  const sanitizedMonthlyStats = removeWhiteSpace(monthlyStats).split('\t');

  const agendaDates = $('.agenda-date', '#calendar_rows').text();
  const agendaDatesArray = removeWhiteSpace(agendaDates).split(',');

  const agendaEvents = $('.agenda-event', '#calendar_rows').contents().length;
  $('.agenda-event', '#calendar_rows').each((i, el) => {
    const splitText = $(el).text().split('\n');
    const textArray = splitText.map(t => t.trim()).filter(s => s);

    data.push({
      id: i,
      textArray
    });
  });

  console.log(data);
};

axios.get(URL)
  .then(resp => {
    getData(resp.data);
  }).catch(error => {
    console.log('ERR:', error);
  });
