const Relationships = require('./Relationships');
const fs = require('fs');
const path = require('path');

let MRRELTXT = fs.readFileSync(path.join(__dirname,'MRREL.RRF'), 'utf8');

let r = new Relationships();

//r.populate(MRRELTXT);
//r.save();

r.load();