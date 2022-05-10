const defaultLanguage = "en";
const locales: any = {
  en: {
    close: "Close",
    confirm: "Confirm",
    tap_send: "Tap on Confirm to send your poll",
    username_created_poll: "$1 created a poll",
    nb_votes: "$1 votes",
    percent_votes: "$1% of votes",
  },
  fr: {
    close: "Fermer",
    confirm: "Confirmer",
    tap_send: "Appuyez sur Confirmer pour envoyer votre sondage",
    username_created_poll: "$1 a créé un sondage",
    nb_votes: "$1 votes",
    percent_votes: "$1% of votes",
  },
};

export const t = (language: string, key: string, variables: string[] = []) => {
  let str = locales[language][key] || locales[defaultLanguage][key] || key;
  variables.forEach((v, i) => (str = str.replace("@" + (i + 1), v)));
  return str;
};
