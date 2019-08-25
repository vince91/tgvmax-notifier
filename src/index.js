const express = require("express");
const sncf = require("./sncf");
const messenger = require("./messenger");
const app = express();
const moment = require("moment");

let origins;
let destinations;
let jobs = [];
let lastId = 0;

app.use(express.json());

app.listen(3000, async () => {
  console.log("Server running on port 3000");

  setInterval(scheduler, 1000);

  origins = await sncf.getAllOrigins();
  destinations = await sncf.getAllDestinations();

  console.log(
    `Found ${origins.length} origins and ${destinations.length} destinations`
  );
});

app.get("/origins", function(req, res) {
  res.send(origins);
});

app.get("/destinations", function(req, res) {
  res.send(destinations);
});

app.get("/jobs", function(req, res) {
  res.send(jobs);
});

app.post("/jobs", function(req, res) {
  const { origin, destination, date } = req.body;

  if (
    !origin ||
    !destination ||
    !date ||
    !origins.includes(origin) ||
    !destinations.includes(destination) ||
    moment(date).isBefore(moment().startOf("day"))
  ) {
    return res.sendStatus(422);
  }

  const id = ++lastId;
  jobs.push({
    id,
    origin,
    destination,
    date,
    lastChecked: null,
    checking: false
  });
  console.log(
    "Added job: " +
      jobToString({ origin, destination, date, id, lastChecked: null })
  );
  res.sendStatus(201);
});

app.delete("/jobs/:id", function(req, res) {
  const index = jobs.findIndex(job => job.id === Number(req.params.id));

  if (index === -1) {
    return res.sendStatus(404);
  }

  console.log("Deleted job: " + jobToString(jobs[index]));

  jobs.splice(index, 1);
  res.sendStatus(200);
});

function jobToString({ origin, destination, date, id, lastChecked }) {
  return `${origin} -> ${destination} on ${date} (id: ${id}, lastChecked: ${
    lastChecked ? moment(lastChecked).format("YYYY-MM-DD HH:mm") : "N/A"
  })`;
}

async function checkJob(job) {
  const { id, lastChecked, checking, origin, destination, date } = job;

  if (
    (!lastChecked ||
      moment(lastChecked)
        .add(60, "second")
        .isBefore()) &&
    !checking
  ) {
    job.checking = true;
    const availability = await sncf.getAvailability(origin, destination, date);

    console.log(
      availability.length ? "✅" : "❌",
      "Checked job: ",
      jobToString(job),
      availability.length + " trains available"
    );

    if (availability.length > 0) {
      messenger.sendUpdate(
        `Train available! ${origin} -> ${destination} on ${date}: ${availability.join(
          ", "
        )}`
      );

      jobs.splice(jobs.findIndex(job => job.id === id), 1);
    } else {
      job.lastChecked = moment().format();
      job.checking = false;
    }
  }
}

async function scheduler() {
  // Remove passed jobs
  jobs = jobs.filter(job =>
    moment(job.date).isSameOrAfter(moment().startOf("day"))
  );

  jobs.forEach(checkJob);
}
