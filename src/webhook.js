const data = require("./data");
const { webhookToken } = require("../config");
const parseMessage = require("./messageParser");

function post(req, res) {
  const { body } = req;

  if (body.object === "page") {
    body.entry.forEach(function(entry) {
      console.log("\nReceived message:\n", JSON.stringify(entry, null, 2));

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

function get(req, res) {
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

module.exports = { post, get };
