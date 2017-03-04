### How this data was generated:

1. Build metathesaurus using the configuration find in this folder (confix.prop). This configuration only includes level 0 `UMLS metathesaurus`
1. Copy `MRSTY.RRF`, `MRCONSO.RRF`, `MRREL.RRF` to this folder
1. Run `grep T029 MRSTY.RRF > T029`
1. Run `node extractBodyPartsRelationships.js`
1. Run `node extractDefinitions.js`