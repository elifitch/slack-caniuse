# caniuse-api
A REST api to query browser support data from Caniuse.com.

## Example env
```
DB_HOST="mongodb://localhost:27017/"
DB_NAME="caniuse"
GITHUB_TOKEN="l0NgA55alPh4NUm3r1C5tRing"
PORT=3000
```

## Endpoints
### Get all caniuse features
`GET` `/features`: Returns all features in Caniuse data
`GET` `/features/search/someFeature`: Searches features for what you want