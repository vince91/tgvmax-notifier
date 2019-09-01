import * as express from "express";
import { checkToken } from "./sncf";
import { post, get } from "./webhook";
import scheduler from "./scheduler";
import { log } from "./utils";
import { initDb, getDb } from "./data";

const app = express();

app.use(express.json());
app.set("json spaces", 4);

app.listen(3000, async () => {
  log("Server running on port 3000");
  await initDb();
  await checkToken();
  setInterval(scheduler, 1000);
});

app.post("/webhook", post);

app.get("/webhook", get);

app.get("/status", (req, res) => {
  res.json(getDb());
});
