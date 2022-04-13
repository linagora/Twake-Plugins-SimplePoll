import express from "express";
import config from "config";
import { HookEvent } from "./types";
import { closeMenu, askConfirm, sendPoll } from "./events";

const prefix =
  "/" +
  ((config.get("server.prefix") || "") as string).replace(/(^\/|\/$)/g, "");
console.log(prefix);

const app = express();

app.use(express.json());
app.use(prefix + "/assets", express.static(__dirname + "/../assets"));

// Entrypoint for every events comming from Twake
app.post(prefix + "/hook", async (req, res) => {
  const event = req.body as HookEvent;

  if (
    (event.type === "interactive_message_action" &&
      event.name === "generate") ||
    (event.type === "action" && event.name === "command") //TODO
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
});

const port = config.get("server.port");
app.listen(port, (): void => {
  console.log(`Plugin started on port ${port}`);
});
