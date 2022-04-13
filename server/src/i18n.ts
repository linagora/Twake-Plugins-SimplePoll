const defaultLanguage = "en";
const locales: any = {
  en: {
    close: "Close",
    confirm: "Confirm",
    tap_send: "Tap on the button to send your poll",
  },
  fr: {
    close: "Fermer",
    confirm: "Confirmer",
    tap_send: "Appuyez sur le bouton pour envoyer votre sondage",
  },
};

export const t = (language: string, key: string, variables: string[] = []) => {
  let str = locales[language][key] || locales[defaultLanguage][key] || key;
  variables.forEach((v, i) => (str = str.replace("@" + (i + 1), v)));
  return str;
};
