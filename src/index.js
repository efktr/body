import React, {Component} from 'react';
import frontImage from '../resources/body.png';
import backImage from '../resources/back.png';
import { Map, ImageOverlay, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/style.css';
import { CRS } from 'leaflet';
import '../css/signal.css';
import { divIcon } from 'leaflet';

const imageSize = {
    width: 640,
    height: 2201
};

const BACK = 'B';
const FRONT = 'F';

export default class EfktrBody extends Component {

    constructor(props){
        super(props);

        this.onBodyPart = props.onBodyPart || function(){};
        this.onClick = props.onClick || function(){};

        let width = imageSize.width;
        let height = imageSize.height;

        while (width > 400 || height > 400) {
            width /= 2;
            height /= 2;
        }

        let imageBounds = [[0, width], [height, 0]];

        this.state = {
            map: {
                width: width,
                height: height,
                bounds: imageBounds
            },
            signal: undefined,
            side: props.back === true ? BACK : FRONT
        };

        this.pointClicked = this.pointClicked.bind(this);
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            side: nextProps.back === true ? BACK : FRONT
        });
    }

    pointClicked(event) {
        this.setState({
            signal: event.latlng
        });

        // TODO - Implement logic that looks up body parts and returns them to user
        this.onBodyPart(['head']);
        this.onClick({
            latlng: event.latlng,
            side: this.state.side
        });
    }

    render() {
        const marker = this.state.signal ? (<Marker
            icon={
                divIcon({
                        iconSize: [30, 30],
                        iconAnchor: [10, 10],
                        popupAnchor: [10, 0],
                        shadowSize: [0, 0],
                        className: 'animated-icon'
                    }
                )
            }
            position={this.state.signal}
        />) : null;

        return (
            <Map
                className="EfktrBodyMap"
                zoom={1}
                maxZoom={1}
                minZoom={1}
                center={[this.state.map.height, this.state.map.width]}
                maxBounds={[[0, this.state.map.width], [this.state.map.height, 0]]}
                crs={CRS.Simple}
                scrollWheelZoom={false}
                tap={false}
                touchZoom={false}
                keyboard={false}
                zoomAnimation={false}
                dragging={false}
                doubleClickZoom={false}
                boxZoom={false}
                onClick={this.pointClicked}
                ref="map"
            >
                <ImageOverlay
                    url={this.state.side === BACK ? backImage : frontImage}
                    bounds={this.state.map.bounds}
                />
                {marker}
            </Map>
        )
    }
}