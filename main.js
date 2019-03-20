mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cmFwb3YiLCJhIjoiY2p0aGo5NW0yMGZnaDN5cGY4NWVoeGt5ZiJ9.IdfRD2MhG562b2oct7daNw';

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-114.1313808,  51.0774501],
    zoom: 14.5,
    // pitch: 45,
    // bearing: -17.6,
    container: 'map'
});

let speedFactor = 3000; // number of frames per longitude degree
let animation; // to store and cancel the animation
let startTime = 0;
let progress = 0; // progress = timestamp - startTime
let geojson;
let timePerPath = 10;
let paths;
var resetTime = false; // indicator of whether time reset is needed for the animation
var pauseButton = document.getElementById('pause');
let currentPathIndex = 0;
let currentCoordIndex = 0;

function animateLine(timestamp) {
    progress = timestamp - startTime;

    let isDrawing = false;
    if (progress < timePerPath) {
       
    } else {
        startTime = performance.now();
        isDrawing = true;
    }

    if (isDrawing) {
         console.log('drawing');
        if (currentPathIndex < paths.length - 1) {
            currentPathIndex++;
            geojson.features.push(paths[currentPathIndex]);
            console.log(paths[currentPathIndex]);
            map.getSource('paths_layer').setData(geojson);
        } else {
            geojson.features = [];
            currentPathIndex = 0;
        }

        isDrawing = false;
    }
    
    // // // restart if it finishes a loop
    // if (progress > speedFactor * 1) {
    //     // console.log('restart');
    //     startTime = timestamp;
    //     // geojson.features[0].geometry.coordinates = [];
    // } else {
    //         // console.log('now');
    //         
    //     }
        
    // // append new coordinates to the lineString
        
    // // then update the map
    //     
    // }
    // Request the next frame of the animation.
    animation = requestAnimationFrame(animateLine);
}


map.on('load', () => {

    d3.json('/data/pathsgeo.json').then(data => {
        geojson = data;
        // geojson.features.splice(1);
        paths = geojson.features;
        // map.addSource('paths', {
        //     type: 'geojson',
        //     data: geojson
        // });

        map.addLayer({
            "id": "paths_layer",
            "type": "line",
            "source": {
                "type": "geojson",
                "data": geojson
            },
            'paint': {
                'line-color': '#ed6498',
                'line-width': 1,
                'line-opacity': 0.2
            }
        });
            

        
        // pauseButton.addEventListener('click', () => {
        //     pauseButton.classList.toggle('pause');
        //     if (pauseButton.classList.contains('pause')) {
        //         cancelAnimationFrame(animation);
        //     } else {
        //         resetTime = true;
        //         animateLine();
        //     }
        //     });

        startTime = performance.now();
        geojson.features = [];
        map.getSource('paths_layer').setData(geojson);
 
        animateLine();

        animation = requestAnimationFrame(animateLine);
    })
    
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