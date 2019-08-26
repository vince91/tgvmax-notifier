import * as express from "express";
import { getAllOrigins, getAllDestinations } from "./sncf";
import { post, get } from "./webhook";
import scheduler from "./scheduler";
import data from "./data";

const app = express();

app.use(express.json());

app.listen(3000, async () => {
  console.log("Server running on port 3000");

  setInterval(scheduler, 1000);

  data.origins = await getAllOrigins();
  data.destinations = await getAllDestinations();

  console.log(
    `Found ${data.origins.length} origins and ${data.destinations.length} destinations`
  );
});

app.post("/webhook", post);

app.get("/webhook", get);
