const moment = require("moment");
const { sendUpdate } = require("./messenger");
const { getAvailability } = require("./sncf");
const data = require("./data");
const { jobToString } = require("./utils");

function scheduler() {
  // Remove passed jobs
  data.jobs = data.jobs.filter(job =>
    moment(job.date).isSameOrAfter(moment().startOf("day"))
  );

  data.jobs.forEach(checkJob);
}

async function checkJob(job) {
  const { id, lastChecked, checking, origin, destination, date } = job;
  const shouldCheck =
    !checking &&
    (!lastChecked ||
      moment(lastChecked)
        .add(60, "second")
        .isBefore());

  if (shouldCheck) {
    job.checking = true;
    const availability = await getAvailability(origin, destination, date);

    console.log(
      availability.length ? "✅" : "❌",
      "Checked job: ",
      jobToString(job),
      availability.length + " trains available"
    );

    if (availability.length > 0) {
      sendUpdate(
        `Train available! ${origin} -> ${destination} on ${date}: ${availability.join(
          ", "
        )}`
      );

      data.jobs.splice(data.jobs.findIndex(job => job.id === id), 1);
    } else {
      job.lastChecked = moment().format();
      job.checking = false;
    }
  }
}

module.exports = scheduler;
