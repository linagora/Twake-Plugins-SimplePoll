# Twake-Plugins-SimplePoll

Simple poll plugin for Twake

### Install

```
sudo docker build -t simple-poll .
sudo docker run \
  --restart unless-stopped \
  -dp 3001:3001 \
  -e SERVER_PORT=3001 \
  -e SERVER_PREFIX='/plugins/simple-poll' \
  -e SERVER_ORIGIN='https://plugin-server.com'
  -e CREDENTIALS_ENDPOINT='https://canary.twake.app' \
  -e CREDENTIALS_ID='abcdef' \
  -e CREDENTIALS_SECRET='some-twake-application-secret' \
  simple-poll
```
