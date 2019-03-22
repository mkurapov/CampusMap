mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cmFwb3YiLCJhIjoiY2p0aGo5NW0yMGZnaDN5cGY4NWVoeGt5ZiJ9.IdfRD2MhG562b2oct7daNw';

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-114.1313808,  51.0774501],
    zoom: 15.5,
    container: 'map'
});

map.on('load', () => {
    Promise.all([
        d3.json('/data/geopaths-small.json'), 
        d3.json('/data/buildings.json')]).then(data => run(data))
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
            "fill-outline-color": "#484896",
            "fill-color": "#6e599f",
            "fill-opacity": 0.75
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
    buildingData = data[1];
    paths = geojson.features;
    addBuildingLayer(buildingData);
    addPathLayer(geojson);
    // registerEventListeners();
    //beginAnimate();
    map.on('click', 'buildings-layer', ev => {
        const targets = map.queryRenderedFeatures(ev.point, { layers: ['buildings-layer'] });
        const bid = targets[0].properties.Building_n;

        if (selectedBuildings.includes(bid)) {
            selectedBuildings = selectedBuildings.filter(id => id != bid);
        } else {    
            selectedBuildings.push(bid);
        }
            
        map.setFilter("buildings-highlighted", ['in', 'Building_n', ...selectedBuildings]);
    });
    
}