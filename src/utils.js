const moment = require("moment");

function jobToString({ origin, destination, date, id, lastChecked }) {
  return `${origin} -> ${destination} on ${date} (id: ${id}, lastChecked: ${
    lastChecked ? moment(lastChecked).format("YYYY-MM-DD HH:mm") : "N/A"
  })`;
}

module.exports = { jobToString };
