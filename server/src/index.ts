import express from "express";
import config from "config";
import { HookEvent } from "./types";
import { closeMenu, askConfirm, sendPoll } from "./events";
import * as crypto from "crypto";

const prefix_conf = config.get("server.prefix");
const prefix =
  (prefix_conf ? "/" : "") +
  ((config.get("server.prefix") || "") as string).replace(/(^\/|\/$)/g, "");

const app = express();

app.use(express.json());
app.use(prefix + "/assets", express.static(__dirname + "/../assets"));

// Entrypoint for every events comming from Twake
app.post(prefix + "/hook", async (req, res) => {
  console.log("Request /hook");
  const event = req.body as HookEvent;

  const signature = req.headers["x-twake-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", config.get("credentials.secret"))
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    res.status(403).send({ error: "Wrong signature" });
    return;
  }

  if (
    (event.type === "interactive_message_action" &&
      event.name === "generate") ||
    (event.type === "action" && event.name === "command")
  ) {
    //Create confirmation view of the poll
    return res.send(await askConfirm(event));
  } else if (
    (event.type === "interactive_message_action" && event.name === "confirm") ||
    (event.type === "interactive_message_action" &&
      event.name?.split("_")[0] === "vote")
  ) {
    //Send the new poll
    return res.send(await sendPoll(event));
  } else if (
    event.type === "interactive_message_action" &&
    event.name === "close"
  ) {
    //Close ephemeral message
    return res.send(await closeMenu(event));
  }

  return res.send({ ok: false });
});

const port = config.get("server.port");
app.listen(port, (): void => {
  console.log(`Plugin started on port ${port}`);
});
