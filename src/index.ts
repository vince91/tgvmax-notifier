import * as express from "express";
import { checkToken } from "./sncf";
import { post, get } from "./webhook";
import scheduler from "./scheduler";

const app = express();

app.use(express.json());

app.listen(3000, async () => {
  console.log("Server running on port 3000");
  await checkToken();
  setInterval(scheduler, 1000);
});

app.post("/webhook", post);

app.get("/webhook", get);
