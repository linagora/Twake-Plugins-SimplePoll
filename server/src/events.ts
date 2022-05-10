import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { HookEvent } from "./types";
import { getAccessToken } from "./utils";
import { askConfirmPoll, formatPoll } from "./messages";
import config from "config";

export const askConfirm = async (event: HookEvent) => {
  const twake_context = {
    company_id: event.content.channel.company_id,
    workspace_id: event.content.channel.workspace_id,
    channel_id: event.content.channel.id, //event.content.message.cache.channel_id,
    thread_id: event.content.thread?.id || "",
  };

  const poll_Content: any = event.content.form;
  const poll_name = event.content.command
    ? // eslint-disable-next-line prettier/prettier
      // eslint-disable-next-line quotes
      event.content.command.split('"')[1]
    : poll_Content
    ? poll_Content.poll_name
    : "";

  const options: any = { options: [] };

  if (event.content.command) {
    // eslint-disable-next-line prettier/prettier
    // eslint-disable-next-line quotes
    event.content.command.split('"').forEach((element, index) => {
      if ((index + 1) % 2 === 0 && index + 1 > 2) {
        options.options.push({
          name: element,
          votes: { number: 0, users: [] },
        });
      }
    });
  }

  const msg = {
    subtype: "application",
    blocks: askConfirmPoll(event.content.user, poll_name, options),
    ephemeral: {
      id: uuidv4(),
      recipient: event.user_id,
      recipient_context_id: event.connection_id,
    },

    context: formatMessageContext(
      event.content.user,
      twake_context,
      poll_name,
      options
    ),
  };

  await sendMessage(msg, twake_context);
};

export const sendPoll = async (event: HookEvent) => {
  const twake_context = {
    company_id: event.content.message.context.company_id,
    workspace_id: event.content.message.context.workspace_id,
    channel_id: event.content.message.context.channel_id,
    thread_id: event.content.message.context.thread_id,
    message_id: "undefined",
  };

  const msg = {
    subtype: "application",

    blocks: formatPoll(
      event.content.user,
      event.content.message.context.poll_name,
      event.content.message.context.options
    ),

    context: formatMessageContext(
      event.content.user,
      event.content.message.context,
      event.content.message.context.poll_name,
      event.content.message.context.options,
      "everyone"
    ),
  };

  let voted = 1;

  if (event.name?.split("_")[0] === "vote") {
    const option_name =
      event.content.message.context.options.options[
        event.name?.split("t")[2] - 1
      ];
    for (let i = 0; i < option_name.votes.users.length; i++) {
      if (event.content.user?.id === option_name.votes.users[i]) {
        const index: number = option_name.votes.users.indexOf(
          event.content.user?.id
        );
        if (index !== 1) option_name.votes.users.splice(index, 1);

        voted = -1;
      }
    }
    if (voted === 1) {
      option_name.votes.users.push(event.content.user?.id);
    }

    option_name.votes.number += voted;

    msg.context = event.content.message.context;
    msg.blocks = formatPoll(
      `${event.content.user?.first_name} ${event.content.user?.last_name}`,
      event.content.message.context.poll_name,
      event.content.message.context.options
    );
    twake_context.thread_id = event.content.message.thread_id;
    twake_context.message_id = event.content.message.id;
  } else if (event.content.message) {
    closeMenu(event);
  }
  await sendMessage(msg, twake_context);
};

export const closeMenu = async (event: HookEvent) => {
  const deletedMessage = event.content.message;
  deletedMessage.subtype = "deleted";
  deletedMessage.id = undefined;
  await sendMessage(deletedMessage, {
    company_id: event.content.message.context.company_id,
    workspace_id: event.content.message.context.workspace_id,
    channel_id: event.content.message.context.channel_id,
  });
};

const formatMessageContext = (
  user: HookEvent["content"]["user"],
  options: any,
  poll_name?: any,
  poll_options?: any,
  allow_delete?: string
) => {
  const lang = user?.preferences.locale || "";
  return {
    company_id: options.company_id,
    workspace_id: options.workspace_id,
    channel_id: options.channel_id,
    thread_id: options.thread_id,
    poll_name: poll_name,
    language: options.language || lang,
    options: poll_options,
    allow_delete: allow_delete,
  };
};

//Send message
const sendMessage = async (
  message: any,
  options: {
    company_id: string;
    workspace_id: string;
    channel_id: string;
    thread_id?: string;
    message_id?: string;
  }
) => {
  let url: string = config.get("credentials.endpoint");

  if (options.thread_id && options.message_id !== "undefined") {
    url += `/api/messages/v1/companies/${options.company_id}/threads/${options.thread_id}/messages/${options.message_id}`;
  } else if (options.thread_id && options.message_id === "undefined") {
    url += `/api/messages/v1/companies/${options.company_id}/threads/${options.thread_id}/messages`;
  } else {
    url += `/api/messages/v1/companies/${options.company_id}/threads`;
  }

  let data: any = {
    resource: message,
  };
  if (!options.thread_id) {
    data = {
      resource: {
        participants: [
          {
            type: "channel",
            id: options.channel_id,
            company_id: options.company_id,
            workspace_id: options.workspace_id,
          },
        ],
      },
      options: {
        message,
      },
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
};
