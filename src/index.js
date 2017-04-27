import React, {Component} from 'react'
import image from '../resources/body.png'
import { Map, ImageOverlay} from 'react-leaflet'
import './style.css'

import Leaflet from 'leaflet/dist/leaflet';
//import LeafletCss from 'leaflet/dist/leaflet.css';

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
                        zoom={1}
                        maxZoom={2}
                        minZoom={0}
                        center={[height, width]}
                        maxBounds={[[0, width], [height, 0]]}
                        crs={Leaflet.CRS.Simple}
                        scrollWheelZoom={false}
                        tap={false}
                        touchZoom={false}
                        keyboard={false}
                        zoomAnimation={false}
                        dragging={false}
                        doubleClickZoom={false}
                        boxZoom={false}
                        onClick={this.pointClicked}
            >
                        <ImageOverlay
                            url={image}
                            bounds={imageBounds}
                        />
                    </Map>
                )
            });
        };
    }

    pointClicked(event) {
        console.log("test");
    }

    render() {
        return <div>
            {this.state.map}
        </div>
    }
}