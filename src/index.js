import React, {Component} from 'react'
import image from '../resources/body.png'
import { Map, ImageOverlay} from 'react-leaflet'
import './style.css'

let Leaflet = require('leaflet');


export default class EfktrBody extends Component {
    constructor(){
        super();

        this.state = {
            map: <div></div>
        };

        let img = new Image();
        img.src = image;

        let self = this;

        img.onload = function(){
            let width = this.width;
            let height = this.height;

            while (width > 500 || height > 500) {
                width /= 2;
                height /= 2;
            }

            let imageBounds = [[0, width], [height, 0]];

            self.setState({
                map: (
                    <Map
                        className="EfktrBodyMap"
                        center={[height / 2, width / 2]}
                        maxBounds={[[-100, width + 100], [height + 100, -100]]}

            >
                        <ImageOverlay
                            url={img.src}
                            bounds={imageBounds}
                        />
                    </Map>
                )
            });
        };
    }

    render() {
        return this.state.map
    }
}