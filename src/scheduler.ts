import * as moment from "moment";
import { sendUpdate } from "./messenger";
import { getAvailability } from "./sncf";
import data from "./data";
import { jobToString, log } from "./utils";

export default function scheduler() {
  // Remove passed jobs
  data.jobs = data.jobs.filter(job =>
    moment(job.date).isSameOrAfter(moment().startOf("day"))
  );

  data.jobs.forEach(checkJob);

  if (data.jobs.length && data.lastSent && moment(data.lastSent).add(15, 'hour').isBefore()) {
    log('Sending update message to user');
    sendUpdate('Still searching?');
  }
}

async function checkJob(job: Job) {
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

    log(
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
