const express = require("express");
const sncf = require("./sncf");
const app = express();

let origins;
let destinations;
let jobs = [];
let lastId = 0;

app.use(express.json());

app.listen(3000, async () => {
  console.log("Server running on port 3000");

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

  jobs.push({ id: ++lastId, origin, destination, date });
  res.sendStatus(201);
  console.log(
    `Added job: ${origin} -> ${destination} on ${date} (id: ${lastId})`
  );
});

app.delete("/jobs/:id", function(req, res) {
  const index = jobs.findIndex(job => job.id === Number(req.params.id));

  if (index === -1) {
    return res.sendStatus(404);
  }

  const { origin, destination, date, id } = jobs[index];
  console.log(
    `Deleted job: ${origin} -> ${destination} on ${date} (id: ${id})`
  );

  jobs.splice(index, 1);
  res.sendStatus(200);
});
