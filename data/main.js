const Relationships = require('./Relationships');
const fs = require('fs');
const path = require('path');

let MRRELTXT = fs.readFileSync(path.join(__dirname,'MRREL.RRF'), 'utf8');

let r = new Relationships();

//r.populate(MRRELTXT);
//r.save();

r.load();

const targets = require(path.join(__dirname, './targets.json'));
const bodyparts = require(path.join(__dirname, './T029Dictionary.json'));

let relations = r.nearest(targets, bodyparts.map(e => e.cui));

fs.writeFileSync(path.join(__dirname,'sideEffectToT029.json'), JSON.stringify(relations));