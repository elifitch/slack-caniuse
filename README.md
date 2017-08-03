# Slack-CanIUse
A caniuse.com integration for slack that will let you query and get notifications when a browser feature is newly supported or deprecated.

## Example env
```
DB_HOST="mongodb://localhost:27017/"
DB_NAME="caniuse"
GITHUB_TOKEN="l0NgA55alPh4NUm3r1C5tRing"
SLACK_CLIENT_ID="l0NgA55alPh4NUm3r1C5tRing"
SLACK_CLIENT_SECRET="l0NgA55alPh4NUm3r1C5tRing"
SLACK_VERIFICATION_TOKEN="l0NgA55alPh4NUm3r1C5tRing"
SLACK_REDIRECT_URI=http://localhost:3000/authorize
PORT=3000
DEBUG="app:"
CLEAN=false
```

## Local dev
Need to expose the local port with Ngrok, and edit the URLs in the slack app dashboard to match the Ngrok url.

## Commands
`/caniuse 'some feature'`: Gives you browser support information for that feature

# TODO
- [x] Auth & integration with Add To Slack button
- [x] Import caniuse data
- [x] Watch caniuse data for changes
- [x] Basic query with slash command
- [x] Advanced/styled query with slash command
- [ ] Passive reminders when features change
	- [ ] Make sure we don't remind a team twice about the same changed feature
- [ ] Don't hard code bot id & token as env var. Need to look up by team/user/channel
- [ ] Better error handling
- [ ] Investigate performance around encode/decode dots in feature model
- [ ] Tests

## Passive Reminder Outline
- [ ] Build list of browsers that has an order, so you can identify what the current, and nearly current versions are
- [ ] When you get new feature data in, take their support data and look at the most recent browser, compare it against the one just before that. If they're different, send a message.
- [ ]

## Future features that would be ✨neato✨
* Programattically draw (node canvas?) a caniuse.com-esque browser support grid, to be sent along as an image
* More configurability. What browsers do you want to show up? What versions do you care about? What's your simple yes/no threshold?
* More flexible search. Try "multiple background images".
* Make a flexible utility wrapper function for caching so it's not so ad-hoc.

## Questions
* Error messages? "I'm sorry I didn't understand your request. Could you be more specific? Something like @caniuse-bot can i use css grid. Or maybe something like @caniuse-bot css grid."
* Reference this https://github.com/slackapi/node-slack-events-api/blob/4ca619723dc37f7966e3a3e808ea3f8cba46f3c9/examples/greet-and-react/index.js#L72-L86
