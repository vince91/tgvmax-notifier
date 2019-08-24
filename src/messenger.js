const config = require("../config");
const axios = require("axios");

const MESSAGE_URL = "https://graph.facebook.com/v4.0/me/messages";

async function sendUpdate(message) {
  const url = MESSAGE_URL + "?access_token=" + config.pageAccessToken;
  const body = {
    messaging_type: "UPDATE",
    recipient: {
      id: config.userPsid
    },
    message: {
      text: message
    }
  };

  return axios.post(url, body);
}

module.exports = { sendUpdate };
