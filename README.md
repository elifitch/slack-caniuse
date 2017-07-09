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
CLEAN=false
```

## Commands
`/caniuse 'some feature'`: Gives you browser support information for that feature

## TODO
- [x] Auth & integration with Add To Slack button
- [x] Import caniuse data
- [x] Watch caniuse data for changes
- [ ] Query with slash command
- [ ] Passive reminders when features change
- [ ] Tests

