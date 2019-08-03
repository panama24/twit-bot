const stripStr = str => str.replace(/\s\s+/g, ' ').split('\t');
const sanitizeText = text => text
  .text()
  .replace(/[\n\t\r]/g,"")
  .split(', ')
  .join();

module.exports = {
  sanitizeText,
  stripStr,
}
