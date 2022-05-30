import { HookEvent, PollOptions } from "./types";
import { t } from "./i18n";

export const formatPoll = (
  user: HookEvent["content"]["user"],
  poll_name: string,
  options: PollOptions,
  context: any
) => {
  const username = [user?.first_name, user?.last_name]
    .map((a) => a?.trim())
    .filter(Boolean)
    .join(" ");
  const lang = user?.preferences.locale || "";
  return [
    {
      type: "twacode",
      elements: [
        {
          type: "system",
          content: t(lang, "username_created_poll", [
            context?.creator_name || username,
          ]),
        },
        {
          type: "attachment",
          content: formatButton(poll_name, options),
        },
        {
          type: "attachment",
          content: formatGraph(options),
        },
      ],
    },
  ];
};

export const askConfirmPoll = (
  user: HookEvent["content"]["user"],
  poll_name: string,
  options: PollOptions
) => {
  const lang = user?.preferences.locale || "";

  return [
    {
      type: "twacode",
      elements: [
        {
          type: "attachment",
          content: [
            {
              type: "bold",
              content: poll_name,
            },
            { type: "br" },
            { type: "system", content: t(lang, "tap_send") },
          ],
        },
        {
          type: "attachment",
          content: formatCompile(options),
        },

        {
          type: "button",
          style: "default",
          action_id: "close",
          content: t(lang, "close"),
        },
        {
          type: "button",
          style: "primary",
          action_id: "confirm",
          content: t(lang, "confirm"),
        },
      ],
    },
  ];
};

const formatCompile = (options: PollOptions) => {
  const options_list = [];
  for (let i = 0; i < options.options.length; i++) {
    options_list.push({
      type: "bold",
      content: {
        type: "compile",
        content:
          options.options[i].name.charAt(0).toUpperCase() +
          options.options[i].name.slice(1),
      },
    });
    options_list.push({ type: "br" });
  }

  return options_list;
};

const formatButton = (poll_name: string, options: PollOptions) => {
  const options_list = [];
  options_list.push({
    type: "bold",
    content: poll_name.charAt(0).toUpperCase() + poll_name.slice(1),
  });
  options_list.push({ type: "br" });
  for (let i = 0; i < options.options.length; i++) {
    options_list.push({
      type: "button",
      style: "default",
      action_id: `vote_opt${i + 1}`,
      content:
        options.options[i].name.charAt(0).toUpperCase() +
        options.options[i].name.slice(1),
    });
  }
  return options_list;
};

const formatGraph = (options: PollOptions) => {
  const lang = options.language || "";

  const options_list = [];
  let total = 0;
  for (let i = 0; i < options.options.length; i++) {
    total += options.options[i].votes.number;
  }
  for (let i = 0; i < options.options.length; i++) {
    options_list.push({
      type: "bold",
      content:
        options.options[i].name.charAt(0).toUpperCase() +
        options.options[i].name.slice(1),
    });
    options_list.push({ type: "br" });
    options_list.push({
      type: "progress_bar",
      progress:
        total === 0 ? 0 : (options.options[i].votes.number * 100) / total,
    });
    options_list.push({
      type: "system",
      content: t(lang, "percent_votes", [
        (total === 0
          ? 0
          : Math.round((options.options[i].votes.number * 100) / total)
        ).toString(),
      ]),
    });
    options_list.push({ type: "br" });
  }
  options_list.push({
    type: "system",
    content: t(lang, "nb_votes", [total.toString()]),
  });
  return options_list;
};
