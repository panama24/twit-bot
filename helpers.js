const stripStr = str => str.replace(/\s\s+/g, ' ').split('\t');
const sanitizeText = text => text
  .text()
  .replace(/[\n\t\r]/g,"")
  .split(', ')
  .join();

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'
];

// 7 or 10
const monthIndex = month => {
  const index =  String(monthNames.indexOf(month));
  return addZeroIfSingleDigit(index);
};

const addZeroIfSingleDigit = num => num.length === 1 ? ('0' + num) : num;

const getDateObject = fullDate => {
  // parsing the date a.k.a. what a fucking nightmare
  // [ '3', ' Saturday', ' August', ' 2019' ]
  const todaysDate = fullDate
    .replace(/([A-Z])/g, ", $1")
    .split(',');

  todaysDate.splice(1, 1)
  // [ '3', 'August', '2019' ]
  const trimmed = todaysDate
    .slice(0)
    .map(str => str.trim());

  const day = addZeroIfSingleDigit(trimmed[0]);
  const month = monthIndex(trimmed[1]);
  const year = trimmed[2];

  return {
    day,
    month,
    year,
  };
};

module.exports = {
  addZeroIfSingleDigit,
  getDateObject,
  monthIndex,
  sanitizeText,
  stripStr,
}
