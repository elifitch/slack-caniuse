# caniuse-updates
This is a simple app which executes a function when caniuse data is updated.  It returns information about any browser support changes for specific features.

## Example env
```
DB_URL=mongodb://localhost:27017/caniuse
GITHUB_TOKEN=l0NgA55alPh4NUm3r1C5tRing
```

## TODO
- [x] Create database
- [ ] check to see if tables exist, if not, establish baseline
- [ ] get the recursive git tree
- [ ] create a row for each file with `features-json/` at the beginning
- [ ] Each key in the json gets a corresponding cell in the row, plus an identifier which is the title of the JSON file itself, and it's git sha, which will be our ID
- [ ] start github watchify
- [ ] When a commit comes through, look for files in the feature json by using `files[index].filename.indexOf('features-json') !== -1`
- [ ] Okay, so a feature json was updated. Replace what was in the cell with the new information, and if it was a note, bug, status change, or a new piece of browser support which was different from the last recorded one, push through a notification.
    - Example: background position x/y, FF 48 N, FF 49 Y. notification goes through saying background position x/y is now supported in firefox 49!
    - And there was much rejoicing.
