mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cmFwb3YiLCJhIjoiY2p0aGo5NW0yMGZnaDN5cGY4NWVoeGt5ZiJ9.IdfRD2MhG562b2oct7daNw';

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-114.130099, 51.077311],
    zoom: 15.5,
    // pitch: 45,
    // bearing: -17.6,
    container: 'map'
});

let speedFactor = 30; // number of frames per longitude degree
let animation; // to store and cancel the animation
let startTime = 0;
let progress = 0; // progress = timestamp - startTime


function animateLine(timestamp) {
    if (resetTime) {
    // resume previous progress
        startTime = performance.now() - progress;
        resetTime = false;
    } else {
        progress = timestamp - startTime;
    }
    
    // restart if it finishes a loop
    if (progress > speedFactor * 360) {
        startTime = timestamp;
        geojson.features[0].geometry.coordinates = [];
    } else {
        const x = progress / speedFactor;
    // append new coordinates to the lineString
        geojson.features[0].geometry.coordinates.push([x, y]);
    // then update the map
        map.getSource('line-animation').setData(geojson);
    }
    // Request the next frame of the animation.
        animation = requestAnimationFrame(animateLine);
}


map.on('load', () => {
    map.addSource('paths', {
        type: 'geojson',
        data: '/data/geopaths-small.json'
    });

    map.addLayer({
            "id": "paths_layer",
            "type": "line",
            "source": "paths",
            'paint': {
                'line-color': '#ed6498',
                'line-width': 1,
                'line-opacity': 0.2
            }
    });
});




function styleMap() {
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    const basicLayer = {
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
        }
    };
    map.addLayer(basicLayer, labelLayerId);
}