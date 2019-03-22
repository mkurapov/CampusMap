mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cmFwb3YiLCJhIjoiY2p0aGo5NW0yMGZnaDN5cGY4NWVoeGt5ZiJ9.IdfRD2MhG562b2oct7daNw';

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-114.1313808,  51.0774501],
    zoom: 15.5,
    container: 'map'
});

map.on('load', () => {
    Promise.all([
        d3.json('/data/geopaths.json'), 
        d3.json('/data/buildings.json')]).then(data => run(data))
});

document.addEventListener('keydown', function(event) {
    if (event.key == '1') {
        selectedBuildings = selectedPaths = [];
        map.setFilter("buildings-highlighted", ['in', 'id', ...selectedBuildings]);
        map.setFilter("paths-highlighted", ['in', 'id', ...selectedPaths]);
    }
});


const pauseButton = document.getElementById('pause');

let geojson;
let buildingData;
let paths;
let currentPathIndex = 0;

let speedFactor = 3000; // number of frames per longitude degree
let animation; // to store and cancel the animation
let startTime = 0;
let progress = 0; // progress = timestamp - startTime
const timePerPath = 10;
let resetTime = false; // indicator of whether time reset is needed for the animation

let selectedBuildings = [];
let selectedPaths = [];

function animateLine(timestamp) {
    progress = timestamp - startTime;

    let isDrawing = false;
    if (progress < timePerPath) {
       
    } else {
        startTime = performance.now();
        isDrawing = true;
    }

    if (isDrawing) {
        if (currentPathIndex < paths.length - 1) {
            currentPathIndex++;
            geojson.features.push(paths[currentPathIndex]);
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

function registerEventListeners() {

    pauseButton.addEventListener('click', () => {
        pauseButton.classList.toggle('pause');
        if (pauseButton.classList.contains('pause')) {
            cancelAnimationFrame(animation);
        } else {
            resetTime = true;
            animateLine();
        }
    });
}
        

function drawLines() {
    //check what filters are on
}

function selectBuilding(bid) {

}

function filterByTime() {
    // can you choose a time interval? hour bins
    //does it all show all paths before
    // hook them up to keyboard to test
}

function getPathsForBuilding(bid) {

}

function addPathLayer(data) {
    map.addLayer({
        "id": "paths-layer",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": data
        },
        'paint': {
            'line-color': '#ed6498',
            'line-width': 1,
            'line-opacity': 0.2
        }
    });

    map.addLayer({
        "id": "paths-highlighted",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": data
        },
        "filter": ["in", "id", ""],
        'paint': {
            'line-color': '#ed6498',
            'line-width': 1,
            'line-opacity': 1
        }
    });
}


function addBuildingLayer(data) {


    map.addLayer({
        "id": "buildings-layer",
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": data
        },
        'paint': {
            'fill-color': '#62B6CB',
            'fill-opacity': 0.2,
            'fill-outline-color': '#000000'
            // 'line-width': 1,
            // 'line-opacity': 0.2
        }
    });

    map.addLayer({
        "id": "buildings-highlighted",
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": data
        },
        // "source-layer": "original",
        "filter": ["in", "Building_n", ""],
        "paint": {
            "fill-outline-color": "#62B6CB",
            "fill-color": "#62B6CB",
            "fill-opacity": 1
            },
        });
}




function beginAnimate() {
    startTime = performance.now();
    geojson.features = [];
    map.getSource('paths_layer').setData(geojson);
    animateLine();
    nimation = requestAnimationFrame(animateLine);
}

function run(data) {
    geojson = data[0];
    console.log(geojson);

    geojson.features = geojson.features.sort(() => 0.5 - Math.random()).filter((d, i) => i < 300);
    buildingData = data[1];
    paths = geojson.features;
    addBuildingLayer(buildingData);
    addPathLayer(geojson);
    // registerEventListeners();
    //beginAnimate();
    map.on('click', ev => {
        // can also just do an intersection of layres instead of storing bid's
        const clickedBuilds = map.queryRenderedFeatures(ev.point, { layers: ['buildings-layer'] });
        const highlightedBuildings = map.queryRenderedFeatures({layers: ['buildings-highlighted']});
        // console.log(highlightedBuildings);
        if (clickedBuilds.length > 0) {
            const bid = clickedBuilds[0].properties.Building_n;
            if (selectedBuildings.includes(bid)) {
                selectedBuildings = selectedBuildings.filter(id => id != bid);
            } else {    
                selectedBuildings.push(bid);
            }
            map.setFilter("buildings-highlighted", ['in', 'Building_n', ...selectedBuildings]);
        }

        if (selectedBuildings.length >= 2) {
            const polygonBuilds = 
                buildingData.features.filter(b => selectedBuildings.includes(b.properties.Building_n))
                                     .map(b => b.geometry.coordinates).map(p => turf.polygon(p));

            for (let i = 0; i < geojson.features.length; i++) {
                const path = geojson.features[i];
                const coords = path.geometry.coordinates;
                
                
                for (let j = 0; j < coords.length; j++) {
                    const pt = turf.point(coords[j]);

                    polygonBuilds.forEach(poly => {
                        if (turf.booleanPointInPolygon(pt, poly)) {
                            selectedPaths.push(path.properties.id)
                        }
                    })
                }
            }

            // const containedLines = geojson.features.
            // console.log(geojson.features)

            map.setFilter("paths-highlighted", ['in', 'id', ...selectedPaths]);
        }

            
    });
    
}