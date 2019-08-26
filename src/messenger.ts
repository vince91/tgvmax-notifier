import data from "./data";
import axios from "axios";
const { pageAccessToken } = require("../config.json");

const MESSAGE_URL = "https://graph.facebook.com/v4.0/me/messages";

function send(text: string, messaging_type: "UPDATE" | "RESPONSE") {
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

  return axios.post(url, body);
}

export function sendUpdate(text: string) {
  return send(text, "UPDATE");
}

export function sendResponse(text: string) {
  return send(text, "RESPONSE");
}
