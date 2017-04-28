import React from 'react'
import {render} from 'react-dom'

import EfktrBody from '../../src'

let Demo = React.createClass({
    render() {
        return <div>
          <h1>Demo</h1>
          <EfktrBody onBodyPart={function(bodyParts){
              console.log(bodyParts)}
          }/>
        </div>
    }
});

render(<Demo/>, document.querySelector('#demo'))
