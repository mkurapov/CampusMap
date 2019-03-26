mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cmFwb3YiLCJhIjoiY2p0aGo5NW0yMGZnaDN5cGY4NWVoeGt5ZiJ9.IdfRD2MhG562b2oct7daNw';

let isUsingTable = false;
const tableSettings = {
    zoom: 15.879236564204465,
    center: [-114.1265761273005, 51.07719623624649]
}

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mkurapov/cjtp3qjvh8bcf1foc9kfzj9ep',
    center: isUsingTable ? tableSettings.center : [-114.1313808,  51.0774501],
    zoom: isUsingTable ? tableSettings.zoom : 15.5,
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

    if (event.key == 'ArrowUp') {
        let zoom = map.getZoom();
        map.jumpTo({'zoom': zoom += 0.025 });
    }

    if (event.key == 'ArrowDown') {
        let zoom = map.getZoom();
        map.jumpTo({'zoom': zoom -= 0.025 });
    }


    // if (event.key == 'ArrowUp') {
    //     let zoom = map.getZoom();
    //     map.jumpTo({'zoom': zoom += 0.025 });
    // }

    // if (event.key == 'ArrowDown') {
    //     let zoom = map.getZoom();
    //     map.jumpTo({'zoom': zoom -= 0.025 });
    // }


});


const pauseButton = document.getElementById('pause');

let pathData;
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
            pathData.features.push(paths[currentPathIndex]);
            map.getSource('paths_layer').setData(pathData);
        } else {
            pathData.features = [];
            currentPathIndex = 0;
        }

        isDrawing = false;
    }
    
    // // // restart if it finishes a loop
    // if (progress > speedFactor * 1) {
    //     // console.log('restart');
    //     startTime = timestamp;
    //     // pathData.features[0].geometry.coordinates = [];
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
            'fill-color': '#ffffff',
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
            "fill-outline-color": "rgb(54,54,54)",
            //  'line-width': 14,
            "fill-color": "#62B6CB",
            "fill-opacity": 1
            },
        });
}


function selectBuilding(bid) {
    if (!selectedBuildings.includes(bid)) {
        selectedBuildings.push(bid);
    } else {
        selectedBuildings = selectedBuildings.filter(id => id != bid);
    }

    map.setFilter("buildings-highlighted", ['in', 'Building_n', ...selectedBuildings]);
}

function deselectBuilding(bid) {
    
}

function beginAnimate() {
    startTime = performance.now();
    pathData.features = [];
    map.getSource('paths_layer').setData(pathData);
    animateLine();
   animation = requestAnimationFrame(animateLine);
}

function run(data) {
    pathData = data[0];
    pathData.features = pathData.features.sort(() => 0.5 - Math.random()).filter((d, i) => i < 300);
    buildingData = data[1];
    paths = pathData.features;
    addBuildingLayer(buildingData);

    addPathLayer(pathData);
    // registerEventListeners();
    //beginAnimate();
    map.on('click', ev => {

        // can also just do an intersection of layres instead of storing bid's
        const clickedBuilds = map.queryRenderedFeatures(ev.point, { layers: ['buildings-layer'] });
        const somepaths = map.queryRenderedFeatures(ev.point, {layers: ['paths-layer']});
        const hipaths = map.queryRenderedFeatures({layers: ['paths-highlighted']});
        
        if (clickedBuilds.length > 0) {
            const bid = clickedBuilds[0].properties.Building_n;
            console.log(bid);
            selectBuilding(bid);

            const pathIds = pathData.features
                .filter(p => selectedBuildings.every(bid => p.properties.bids.includes(bid)))
                .map(p => p.properties.id);
            map.setFilter("paths-highlighted", ['in', 'id', ...pathIds]);
        }
        
        if (selectedBuildings.length >= 2) {
            // console.log(selectedBuildings);
            // console.log(pathData.features)
        }

        console.log(somepaths);
        console.log(hipaths);
        console.log(selectedBuildings);
      

        // if (selectedBuildings.length >= 2) {
        //     const polygonBuilds = 
        //         buildingData.features.filter(b => selectedBuildings.includes(b.properties.Building_n))
        //                              .map(b => b.geometry.coordinates).map(p => turf.polygon(p));

        //     for (let i = 0; i < pathData.features.length; i++) {
        //         const path = pathData.features[i];
        //         const coords = path.geometry.coordinates;
                
                
        //         for (let j = 0; j < coords.length; j++) {
        //             const pt = turf.point(coords[j]);

        //             polygonBuilds.forEach(poly => {
        //                 if (turf.booleanPointInPolygon(pt, poly)) {
        //                     selectedPaths.push(path.properties.id)
        //                 }
        //             })
        //         }
        //     }

        //     // const containedLines = pathData.features.
        //     // console.log(pathData.features)

        //     map.setFilter("paths-highlighted", ['in', 'id', ...selectedPaths]);
        // }
    });
}