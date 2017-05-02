const fs = require('fs');
const path = require('path');

class Relationships {
    constructor(MRREL){
        this.relationships = {};

        if(MRREL){
            this.populate(MRREL);
        }
    }

    populate(MRREL){
        MRREL.split("\n")
            .filter(x => x != '')
            .forEach(x => {

                // Make line JSON object
                x = x.split("|");
                x = {
                    "from": x[0],
                    "rel": x[3],
                    "to": x[4]
                };

                // Figure out if from/to exists, if not, create nodes
                let to, from;
                if(this.relationships[x.to]){
                    to = this.relationships[x.to];
                } else {
                    to = this.relationships[x.to] = {
                        parents: new Set(),
                        children: new Set(),
                        neighbours: new Set(),
                        other: new Set()
                    };
                }
                if(this.relationships[x.from]){
                    from = this.relationships[x.from];
                } else {
                    from = this.relationships[x.from] = {
                        parents: new Set(),
                        children: new Set(),
                        neighbours: new Set(),
                        other: new Set()
                    };
                }

                /**
                 * From https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/release/abbreviations.html#REL
                 RB	has a broader relationship
                 RL	the relationship is similar or "alike". the two concepts are similar or "alike". In the current edition of the Metathesaurus, most relationships with this attribute are mappings provided by a source, named in SAB and SL; hence concepts linked by this relationship may be synonymous, i.e. self-referential: CUI1 = CUI2. In previous releases, some MeSH Supplementary Concept relationships were represented in this way.
                 RN	has a narrower relationship
                 RO	has relationship other than synonymous, narrower, or broader
                 RQ	related and possibly synonymous.
                 RU	Related, unspecified
                 */
                switch(x.rel) {
                    case 'RN':
                        // FROM ---> TO
                        from.children.add(x.to);
                        to.parents.add(x.from);
                        break;
                    case 'RB':
                        // FROM <--- TO
                        from.parents.add(x.to);
                        to.children.add(x.from);
                        break;
                    case 'RQ':
                    case 'RL':
                        // FROM <----> TO
                        from.neighbours.add(x.to);
                        to.neighbours.add(x.from);
                        break;
                    default:
                        // FROM ---- TO
                        to.other.add(x.from);
                        from.other.add(x.to);
                        break;
                }

                this.relationships[x.to] = to;
                this.relationships[x.from] = from;
            });
    }

    save(filename = 'reldump.json'){
        fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(
            // Turn sets into arrays (otherwise stringify doesn't work)
            Object.keys(this.relationships).reduce((previous, current) => {
                let x = this.relationships[current];

                x.parents = [...x.parents];
                x.children = [...x.children];
                x.neighbours = [...x.neighbours];
                x.other = [...x.other];

                previous[current] = x;
                return previous;
            }, {})
        ));
        return true;
    }


    load(filename = 'reldump.json'){
        this.relationships = JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf8'));

        // Turn arrays into sets
        this.relationships = Object.keys(this.relationships).reduce((previous, current) => {
            let x = this.relationships[current];

            x.parents = new Set(x.parents);
            x.children = new Set(x.children);
            x.neighbours = new Set(x.neighbours);
            x.other = new Set(x.other);

            previous[current] = x;

            return previous;
        }, {});

        return true;
    }

    nearest(sources, targets, set = this.relationships){
        // Make lookup more efficient by annotating targets --> requires more RAM

        let cloneObject = (obj) => {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }

            // Convert sets to arrays    !!! IMPORTANT !!! (Set uses size, array uses length + array is more useful for lookup, I don't need the Set concept as no inserts!
            if (obj.constructor === Set){
                return [...obj];
            }

            let temp = new obj.constructor(); // give temp the original obj's constructor
            for (let key in obj) {
                temp[key] = cloneObject(obj[key]);
            }

            return temp;
        };

        let superset = cloneObject(set);

        for(let key in superset){
            let match = targets.find(e => e === key);

            if(match){
                superset[key].STOP = true;
            }
        }

        let horizontalSearch = (neighbours, visited, level, step = 0) => {
            if(neighbours !== undefined && neighbours.length > 0){
                visited = visited.concat(neighbours);
                // Assign key-values
                let candidates = neighbours.map(e => {
                    return superset[e];
                });

                let others = candidates.reduce((previous, current) => {
                    return previous.concat(current.other);
                }, []);

                let searchSpace = others.map(e => {
                    return superset[e];
                });

                let matchIndex = searchSpace.findIndex(e => e.STOP);

                if(matchIndex !== -1){
                    return [{
                        level: level,
                        step: step,
                        target: others[matchIndex]
                    }, visited];
                } else {
                    let searchSpace = candidates
                        .reduce((previous, current) => {
                            return previous.concat(current.neighbours);
                        }, [])
                        .filter((candidate => visited.find(e => e === candidate) === undefined));

                    return horizontalSearch(searchSpace, visited, level, ++step);
                }
            } else {
                return [false, visited];
            }
        };

        // Idea:
        //  0. Look at self: if STOP, return
        //  1. Look at all neighbours.
        //      2A. If others have STOP, return
        //      2B. If others have no STOP,
        //          3. GOTO 0 for every child
        //              4. If no result, GOTO 0 for every parent
        //                  5. If still nothing, return

        // Notes: Can be improved using memorization!

        // TODO - Highly experimental and in progress
        let omniDirectionalSearch = (element, visited, level=0, step=0, neighbourhood = 2) => {
            visited.push(element);

            let current = superset[element];
            let result;

            if(current.STOP){
                return [{
                    level: level,
                    step: step,
                    target: element
                }];
            } else if(current.neighbours.length > 0) {
                let [temp, newVisited] = horizontalSearch(current.neighbours, visited, level, ++step);

                visited = newVisited;

                if (temp !== false) {
                    return [temp];
                }
            } else if(Math.abs(level) <= neighbourhood){
                --level;
                let narrower = current.children.filter(e => visited.find(el => el === e) === undefined);

                for (let i = 0; i < narrower.length; i++) {
                    let [temp, newVisited] = omniDirectionalSearch(narrower[i], visited, level, step);

                    visited = visited.concat(newVisited);

                    if (temp !== undefined) {
                        result = temp;
                    }
                }

                if (result !== undefined) {
                    return [result];
                } else {
                    ++level;
                    let broader = current.parents.filter(e => visited.find(el => el === e) === undefined);

                    for (let i = 0; i < broader.length; i++) {

                        let [temp, newVisited] = omniDirectionalSearch(broader[i], visited, level, step);

                        visited = visited.concat(newVisited);

                        if (temp !== undefined) {
                            result = temp;
                        }
                    }

                    if (result !== undefined) {
                        return [result];
                    } else {
                        return [undefined, []];
                    }
                }
            } else {
                return [undefined, []];
            }
        };

        return sources.map(e => {
            let [result] = omniDirectionalSearch(e, []);

            if(result !== undefined){
                result.source = e;
            }
            return result;
        })
            .filter(e => e !== undefined);
    }

    annotate(targets, properties, set = this.relationships){

    }
}

module.exports = Relationships;