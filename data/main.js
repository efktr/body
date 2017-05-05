const fs = require('fs');
const path = require('path');

// 1
// let MRRELTXT = fs.readFileSync(path.join(__dirname,'MRREL.RRF'), 'utf8');
// const Relationships = require('./Relationships');
// let r = new Relationships();
// r.populate(MRRELTXT);

// 2 -- Don't save AND load
// r.save();
// r.load();

// 3
// const targets = require('./targets.json');
// const bodyparts = require('./T029Dictionary.json');
//
// let relations = r.nearest(targets, bodyparts.map(e => e.cui));
//
// fs.writeFileSync(path.join(__dirname,'sideEffectToT029.json'), JSON.stringify(relations));


// 4
// const sideEffectToT029 = require('./sideEffectToT029.json');
// const bodyPartsDictionary = require('./T029Dictionary.json');
//
// let relevantT029 = new Set(sideEffectToT029.map(e => e.target));
//
// console.log("Found " + relevantT029.size + " relevant CUIs");
//
// let filteredBodyPartsDictionary = bodyPartsDictionary.filter(e => {
//     return relevantT029.has(e.cui);
// });
//
// fs.writeFileSync(path.join(__dirname,'T029DictionaryFiltered.json'), JSON.stringify(filteredBodyPartsDictionary));