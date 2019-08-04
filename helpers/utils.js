const strip = str => str.replace(/\s\s+/g, ' ').split('\t');
const sanitizeText = text => text
  .text()
  .replace(/[\n\t\r]/g,"")
  .split(', ')
  .join();

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'
];

const monthIndex = month => {
  const index =  String(monthNames.indexOf(month));
  return addZeroIfSingleDigit(index);
};

// 7 --> 07
const addZeroIfSingleDigit = num => num.length === 1 ? ('0' + num) : num;

const getDateObject = fullDate => {
  // [ '3', ' Saturday', ' August', ' 2019' ]
  const todaysDate = fullDate
    .replace(/([A-Z])/g, ", $1")
    .split(',');

  // remove day of week
  todaysDate.splice(1, 1)
  const [day, month, year] = todaysDate
    .slice(0)
    .map(str => str.trim());

  return {
    day: addZeroIfSingleDigit(day),
    month: monthIndex(month),
    year,
  };
};

module.exports = {
  addZeroIfSingleDigit,
  getDateObject,
  monthIndex,
  sanitizeText,
  strip,
}

