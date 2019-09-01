import data from "./data";
import axios from "axios";
import * as moment from "moment";
import { logError } from "./utils";
const { pageAccessToken } = require("../config.json");

const MESSAGE_URL = "https://graph.facebook.com/v4.0/me/messages";

async function send(text: string, messaging_type: "UPDATE" | "RESPONSE") {
  const url = MESSAGE_URL + "?access_token=" + pageAccessToken;
  const body = {
    messaging_type,
    recipient: {
      id: data.userPsid
    },
    message: {
      text
    }
  };

  data.lastSent = moment();

  try {
    await axios.post(url, body);
  } catch ({ response }) {
    logError("\nCould not send message:", text);
    logError(response.status, response.data);
  }
}

export function sendUpdate(text: string) {
  send(text, "UPDATE");
}

export function sendResponse(text: string) {
  send(text, "RESPONSE");
}
