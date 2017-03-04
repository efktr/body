/**
 * Created by chdallago on 04/03/2017.
 */


const fs = require('fs');
const path = require('path');

console.log("Loading T029Relationships.json file");
const relationships = require(path.join(__dirname,'T029Relationships.json'));
const broadening = relationships.filter(x => x.rel == "RB");

let findRoot = x => {
    let parents = broadening.filter(e => e.from == x);

    if(parents.length == 0){
        return x;
    } else {
        // !!!! IMPORTANT: only look into the root starting from first RB partner!
        return findRoot(parents[0].to);
    }
};

console.log("Loading T029 file");
fs.readFile(path.join(__dirname,'T029'), 'utf8', function (error, t029) {
    console.log("Loading MRCONSO.RRF file");
    fs.readFile(path.join(__dirname,'MRCONSO.RRF'), 'utf8', function (error, mrconso) {
        let definitions = {};
        console.log("Building definitions dictionary");
        mrconso
            .split("\n")
            .filter(x => x != '')
            .forEach(x => {
                let item = x.split("|");
                let cui = item[0];
                let definition = item[14];
                definitions[cui] = definition;
            });

        console.log("Building definitions tree based on T029 and T029relationships.");
        let bodyLocationOrRegion = t029
            .split("\n")
            .filter(x => x != '')
            .map(x => {
                let cui = x.split("|")[0];

                let current = {
                    cui: cui,
                    definition: definitions[cui]
                };

                let root = findRoot(cui);

                if(root != cui){
                    current.root = root;
                }

                return current;
            });

        console.log("Saving definitions tree in T029DefinitionsTree.json");
        fs.writeFile(path.join(__dirname,'T029DefinitionsTree.json'), JSON.stringify(bodyLocationOrRegion), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("T029DefinitionsTree saved.");
        });

        fs.writeFile(path.join(__dirname,'T029DefinitionsTree.tsv'), bodyLocationOrRegion
                .map(x => {
                    return x.cui + "\t" + x.definition;
                })
                .join("\n")
            , function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("T029RootDictionary.tsv saved.");
            });

        console.log("Saving definitions dictionary as CID --> DEF or CID --> ROOT DEF if CID has ROOT in T029Dictionary.json");
        let dict = bodyLocationOrRegion
            .map(x => {
                let result = {
                    cui: x.cui
                };

                if(x.root !== undefined){
                    result.definition = definitions[x.root];
                } else {
                    result.definition = x.definition;
                }

                return result;
            });

        fs.writeFile(path.join(__dirname,'T029Dictionary.json'), JSON.stringify(dict), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("T029Dictionary.json saved.");
        });

        fs.writeFile(path.join(__dirname,'T029Dictionary.tsv'), dict
                .map(x => {
                    return x.cui + "\t" + x.definition;
                })
                .join("\n")
            , function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("T029Dictionary.tsv saved.");
            });

        console.log("Saving definitions dictionary for roots as CID --> DEF if CID has no ROOT in T029RootDictionary.json");

        let rootDict = bodyLocationOrRegion
            .filter(x => x['root'] === undefined)
            .map(x => {
                return {
                    "cui": x.cui,
                    "definition": x.definition
                }
            });

        fs.writeFile(path.join(__dirname,'T029RootDictionary.json'), JSON.stringify(rootDict), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("T029RootDictionary.json saved.");
        });

        fs.writeFile(path.join(__dirname,'T029RootDictionary.tsv'), rootDict
                .map(x => {
                    return x.cui + "\t" + x.definition;
                })
                .join("\n")
            , function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("T029RootDictionary.tsv saved.");
            });
    });
});