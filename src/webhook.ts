import data from "./data";
import parseMessage from "./messageParser";
import { Request, Response } from "express";
import { log } from "./utils";
const { webhookToken } = require("../config.json");

export function post(req: Request, res: Response) {
  const { body } = req;

  if (body.object === "page") {
    body.entry.forEach(function(entry: any) {
      log("\nReceived message:\n", JSON.stringify(entry, null, 2));

      const {
        sender: { id },
        message: { text }
      } = entry.messaging[0];

      data.userPsid = id;
      parseMessage(text);
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
}

export function get(req: Request, res: Response) {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === webhookToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
}
