import React from 'react'
import {render} from 'react-dom'

import EfktrBody from '../../src'

let Demo = React.createClass({
  render() {
    return <div>
      <h1>efktr-body-react Demo</h1>
      <EfktrBody/>
    </div>
  }
});

render(<Demo/>, document.querySelector('#demo'))
