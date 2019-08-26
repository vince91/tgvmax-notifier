import { sendResponse } from "./messenger";
import * as moment from "moment";
import * as Fuse from "fuse.js";
import data from "./data";
import { jobToString } from "./utils";

const CREATE_REGEX = /create (.*)-(.*)(\d\d\/\d\d\/\d\d\d\d)/im;
const DELETE_REGEX = /delete(?:\s)*(\d*)/im;
const STATUS_REGEX = /status/im;

const options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1
};

export default function parseMessage(message: string) {
  if (CREATE_REGEX.test(message)) {
    const { origins, destinations } = data;
    const [, origin, destination, date] = CREATE_REGEX.exec(message);

    if (moment(date, "DD/MM/YYYY").isBefore(moment().startOf("day"))) {
      return sendResponse("Invalid date: " + date);
    }

    const originResult = new Fuse(origins, options).search(origin);
    const destinationResult = new Fuse(destinations, options).search(
      destination
    );

    if (!originResult.length) {
      return sendResponse("Invalid origin");
    }

    if (!destinationResult.length) {
      return sendResponse("Invalid destination");
    }

    const job: Job = {
      id: ++data.lastId,
      origin: origins[Number(originResult[0])],
      destination: destinations[Number(destinationResult[0])],
      date: moment(date, "DD/MM/YYYY").format("YYYY-MM-DD"),
      lastChecked: null,
      checking: false
    };

    data.jobs.push(job);

    sendResponse(
      `🚄 Job #${job.id} created: ${job.origin} > ${job.destination} on ${date}`
    );

    console.log("Added job: " + jobToString(job));
  } else if (DELETE_REGEX.test(message)) {
    const [, id] = DELETE_REGEX.exec(message);

    const jobIndex = data.jobs.findIndex(job => job.id === Number(id));

    if (jobIndex === -1) {
      return sendResponse(`4️⃣0️⃣4️⃣ Job #${id} not found`);
    }

    data.jobs.splice(jobIndex, 1);
    sendResponse(`🚮 Deleted job #${id}`);
  } else if (STATUS_REGEX.test(message)) {
    if (!data.jobs.length) {
      return sendResponse("No jobs running");
    }
    sendResponse(
      data.jobs
        .map(
          job =>
            `#${job.id}: ${job.origin} > ${job.destination} ${moment(
              job.date
            ).format("DD/MM/YYYY")}`
        )
        .join("\n")
    );
  }
}
