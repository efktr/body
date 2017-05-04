### How this data was generated:

1. Build metathesaurus using the configuration find in this folder (confix.prop). This configuration only includes level 0 `UMLS metathesaurus`
1. Copy `MRSTY.RRF`, `MRCONSO.RRF`, `MRREL.RRF` to this folder
1. Run `grep T029 MRSTY.RRF > T029`
1. Run `node extractBodyPartsRelationships.js`
1. Run `node extractDefinitions.js`
1. On the database containing the UMLS dictionary for side effects: `SELECT JSON_AGG(DISTINCT umls_id) from umls_dictionary;`
and save output in `targets.json`
1. See `main.js` and do steps 1...4 