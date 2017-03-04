/**
 * Created by chdallago on 04/03/2017.
 */

const fs = require('fs');
const path = require('path');

console.log("Loading T029 file");
fs.readFile(path.join(__dirname,'T029'), 'utf8', function (error, data) {
    let bodyLocationOrRegion = data
        .split("\n")
        .filter(x => x != '')
        .map(x => {
            let columns = x.split("|");
            return {
                "cid": columns[0]
            }
        });

    console.log("Loading MRREL.RRF file");
    fs.readFile(path.join(__dirname,'MRREL.RRF'), 'utf8', function (error, data) {
        console.log("Filtering relationships based on co-occurrence in from and to fields. This might take a while...");
        let relationships = data
            .split("\n")
            .filter(x => x != '')
            .map(x => {
                let columns = x.split("|");
                return {
                    "from": columns[0],
                    "rel": columns[3],
                    "to": columns[4]
                }
            })
            .filter(x => {
                /**
                 * From https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/release/abbreviations.html#REL
                 RB	has a broader relationship
                 RL	the relationship is similar or "alike". the two concepts are similar or "alike". In the current edition of the Metathesaurus, most relationships with this attribute are mappings provided by a source, named in SAB and SL; hence concepts linked by this relationship may be synonymous, i.e. self-referential: CUI1 = CUI2. In previous releases, some MeSH Supplementary Concept relationships were represented in this way.
                 RN	has a narrower relationship
                 RO	has relationship other than synonymous, narrower, or broader
                 RQ	related and possibly synonymous.
                 RU	Related, unspecified
                 */
                if(
                    bodyLocationOrRegion.filter(y => y.cid == x.from).length > 0 &&
                    bodyLocationOrRegion.filter(y => y.cid == x.to).length > 0
                ){
                    switch(x.rel) {
                        case "RN":
                            return true;
                        case "RB":
                            return true;
                    }
                } else {
                    return false;
                }
                return false;
            });

        console.log("Saving RAW T029Relationships");
        fs.writeFile(path.join(__dirname,'T029Relationships.json'), JSON.stringify(relationships), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("T029Relationships saved.");
        });
    });
});