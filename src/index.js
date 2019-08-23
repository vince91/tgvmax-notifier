const express = require("express");
const sncf = require("./sncf");
const app = express();
const moment = require("moment");

let origins;
let destinations;
let jobs = [];
let lastId = 0;

const SCHEDULER_INTERVAL = 1000;
const JOB_INTERVAL = 60000;

app.use(express.json());

app.listen(3000, async () => {
  console.log("Server running on port 3000");

  setInterval(scheduler, SCHEDULER_INTERVAL);

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
    !destinations.includes(destination)
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
  return `${origin} -> ${destination} on ${date} (id: ${id}, lastedChecked: ${
    lastChecked ? moment(lastChecked).format("YYYY-MM-DD HH:mm") : "N/A"
  })`;
}

function scheduler() {
  const now = new Date();

  for (const job of jobs) {
    const jobTime = new Date(job.lastChecked).getTime();

    if (!jobTime || (jobTime + JOB_INTERVAL < now.getTime() && !job.checking)) {
      job.checking = true;
      console.log("Checking: ", jobToString(job));
      job.lastChecked = new Date().toISOString();
      job.checking = false;
    }
  }
}
