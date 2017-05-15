import React, {Component} from 'react';
import {render} from 'react-dom'

import EfktrBody from '../../src'

class Demo extends Component {

    constructor(){
        super();
        this.state = {
            flip: false
        }
    }

    render() {
        return <div>
            <h1>Demo</h1>
            Flip ?
            <input type="checkbox" onChange={e => this.setState({
                flip: e.target.checked
            })}/>
            <EfktrBody
                back={this.state.flip}
                onBodyPart={function(bodyParts){
                    console.log(bodyParts);
                }
                }
                onClick={function(latlng) {
                    console.log(latlng);
                }
                }
            />
            <EfktrBody
                back={!this.state.flip}
            />
        </div>
    }

}

render(<Demo/>, document.querySelector('#demo'));
