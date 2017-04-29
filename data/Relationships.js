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
                        to.other.add(from);
                        from.other.add(to);
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
        let superset = set.copy();

        for(let key in superset){
            let match = targets.find(e => e === key);
            if(match){
                superset[key].STOP = true;
            }
        }

        // Idea:
        //  0. Look at self: if STOP, return
        //  1. Look at all others.
        //      2A. If others have STOP, return
        //      2B. If others have no STOP,
        //          3. Start from 1 for every neighbour.
        //      2C. If others is empty, return nothing.
        //  4. IF no neighbour has STOP,
        //  5. go one level up/down (all fathers and all children) and do 1.
        //  6. If still nothing, return nothing.

        // Notes: Can be improved using memorization!

        // TODO - Highly experimental and in progress
        return sources.map(element => {
                let level = 0;
                let current = superset[element];

                if(current.STOP){
                    return {
                        level: level,
                        results: element
                    };
                } else {
                    if(current.other.length > 0){
                        let others = current.other.map(e => {
                            return superset[e];
                        });

                        let matchIndex = others.findIndex(e => e.STOP);
                        if(matchIndex !== -1){
                            return {
                                level: level,
                                results: current.other[matchIndex]
                            };
                        } else {
                            // TODO - Look at all others!, IF the result of that is undefined, go to level -1/+1
                            return;
                        }
                    } else {
                        return false;
                    }

                }
            }
        );
    }

    annotate(targets, properties, set = this.relationships){

    }
}

module.exports = Relationships;