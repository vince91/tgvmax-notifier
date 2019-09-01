import * as moment from "moment";
import { sendUpdate } from "./messenger";
import { getAvailability } from "./sncf";
import { jobToString, log, logError } from "./utils";
import {
  getJobs,
  getLastSent,
  setJobs,
  removeJob,
  setJobLastChecked
} from "./data";

export default async function scheduler() {
  // Remove passed jobs
  const jobs = getJobs().filter(job =>
    moment(job.date).isSameOrAfter(moment().startOf("day"))
  );

  await setJobs(jobs);

  jobs.forEach(checkJob);

  const lastSent = getLastSent();
  if (
    jobs.length &&
    lastSent &&
    moment(lastSent)
      .add(15, "hour")
      .isBefore()
  ) {
    log("Sending update message to user");
    sendUpdate("Still searching?");
  }
}

const checking = new Set<number>();

async function checkJob(job: Readonly<Job>) {
  const { lastChecked, origin, destination, date } = job;
  const shouldCheck =
    !checking.has(job.id) &&
    (!lastChecked ||
      moment(lastChecked)
        .add(60, "second")
        .isBefore());

  if (shouldCheck) {
    checking.add(job.id);

    try {
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

        await removeJob(job);
      } else {
        await setJobLastChecked(job, moment().format());
      }
    } catch ({ response }) {
      logError(response.status, response.data);
    } finally {
      checking.delete(job.id);
    }
  }
}
