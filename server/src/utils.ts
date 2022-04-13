import config from "config";
import fetch from "node-fetch";

export const getAccessToken = async (): Promise<string> => {
  const url = config.get("credentials.endpoint") + "/api/console/v1/login";
  const body = {
    id: config.get("credentials.id"),
    secret: config.get("credentials.secret"),
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data.resource.access_token.value;
};
