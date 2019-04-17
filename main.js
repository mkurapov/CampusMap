mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cmFwb3YiLCJhIjoiY2p0aGo5NW0yMGZnaDN5cGY4NWVoeGt5ZiJ9.IdfRD2MhG562b2oct7daNw';
const allBuildings = ["GS","MF","GR","OO","TRA","SH","KNB","MFH","CC","ST","EN","EEEL","AB","DC","RC","TFDL","EDC","EDT","TI","BI","TRB","EN","IH","OL","CD","GL","HP","YA","KA","PP","RU","CDC","WS","VC","VC","CR","15BI","15PF","EDT","AU","15TFDL","EN","AD","PF","MT","MB","CH","RT","KNA","MSC","MH","CCIT","ICT","ES","SB","SS","SA","MS","TFDL2"];

let isUsingTable = false;
let isUsingPlayArea = false;

const tableSettings = {
    zoom: 15.879236564204465,
    center: [-114.1265761273005, 51.07719623624649]
}

const playareaSettings = {
    zoom: 15.5,
    center: [-114.12703253970648, 51.077833820801914]
}

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mkurapov/cjtp3qjvh8bcf1foc9kfzj9ep',
    center: isUsingPlayArea ? playareaSettings.center : [-114.1313808,  51.0774501],
    zoom: isUsingPlayArea ? playareaSettings.zoom : 15.5,
    container: 'map'
});

map.on('load', () => {
    Promise.all([
        d3.json('/data/geopaths.json'), 
        d3.json('/data/buildings.json')]).then(data => run(data))
});

document.addEventListener('keydown', function(event) {
    if (event.key == '1') {
        console.log(map.getCenter())
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


    if (event.code == 'Space') {
        let bid = '';
        if (stepIndex == 0 || stepIndex == 5) {
            bid = 'MH';
        }

        if (stepIndex == 1 || stepIndex == 4) {
            bid = 'KNA';
        }

        if (stepIndex == 2 || stepIndex == 3) {
            bid = 'SA';
            
        }

        if (stepIndex == 5) {
            stepIndex = -1;
        }


        selectBuilding(bid);

        if (selectedBuildings.length > 0) {
            selectedPaths = pathData.features
            .filter(p => !selectedBuildings.some(bid => p.properties.bids.includes(bid))) 
            .map(p => p.properties.id);
        } else {
            selectedPaths = [];
        }
         
        map.setFilter("paths-layer", ['in', 'id', ...selectedPaths]);

        stepIndex++;
    }
});

let stepIndex = 0;



const pauseButton = document.getElementById('pause');
const timeEl = document.getElementById('time');
const knobs = document.getElementsByClassName('svg-container');
const slider = document.getElementById('slider');

let pathData;
let buildingData;
let paths;
let currentPathIndex = 0;

let speedFactor = 3000; // number of frames per longitude degree
let animation; // to store and cancel the animation
let startTime = 0;
let progress = 0; // progress = timestamp - startTime
const timePerPath = 1;
let resetTime = false; // indicator of whether time reset is needed for the animation

let selectedBuildings = [];
let selectedPaths = [];

let currentHour = 0;

// https://docs.mapbox.com/mapbox-gl-js/example/animate-a-line/
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
            map.getSource('paths-layer').setData(pathData);
        } else {
            pathData.features = [];
            currentPathIndex = 0;
        }

        isDrawing = false;
    }
    
    animation = requestAnimationFrame(animateLine);
}

function getPathsForCurrentHour() {
    return pathData.features
    .filter(p => {
        const pathHour = parseInt(p.properties.startTime.slice(0,2));
        return pathHour == currentHour;
    })
    .map(p => p.properties.id);
}

function updateTime(hour) {
    currentHour = hour;
 
    const pathsForHour = getPathsForCurrentHour();
    selectedPaths = selectedPaths.filter(sp => !pathsForHour.includes(sp));
            

    map.setFilter("paths-layer", ['in', 'id', ...selectedPaths]);
    // map.setFilter("paths-highlighted", ['in', 'id', '']);
    
    let date = new Date();
    date.setHours(hour);
    date.setMinutes(0);
    timeEl.textContent = date.toTimeString().slice(0, 5);
}

function registerEventListeners() {

    // pauseButton.addEventListener('click', () => {
    //     pauseButton.classList.toggle('pause');
    //     if (pauseButton.classList.contains('pause')) {
    //         cancelAnimationFrame(animation);
    //     } else {
    //         resetTime = true;
    //         animateLine();
    //     }
    // });

    slider.addEventListener('input', e => updateTime(parseInt(e.target.value)));
}
        

function drawLines() {
    //check what filters are on
}

function filterByTime() {
    // can you choose a time interval? hour bins
    //does it all show all paths before
    // hook them up to keyboard to test
}

function getPathsForBuilding(bid) {

}

function addPathLayer(data) {

    const lineColor = [
        'match',
        ['get', 'bearingName'],
        'N', 'rgb(255,0,0)',
        'NE','rgb(255,133,0)',
        'E','rgb(255,255,0)',
        'SE', 'rgb(133,255,0)',
        'S','rgb(0,133,133)',
        'SW', 'rgb(0,0,255)',
        'W','rgb(87,41,203)',
        'NW', 'rgb(133,0,133)',
        /* other */ '#ccc'
    ];


    map.addLayer({
        "id": "paths-layer",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": data
        },
        'paint': {
            'line-color': lineColor,
            'line-width': 1,
            'line-opacity': 0.1
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
            'fill-opacity': 0.1,
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

function beginAnimate() {
    startTime = performance.now();
    pathData.features = [];
    // map.getSource('paths_layer').setData(pathData);
    animateLine();
    animation = requestAnimationFrame(animateLine);
}

function addCompassDirection() {
    pathData.features.forEach(p => {
        const coords = p.geometry.coordinates;
        const startPoint = coords[0];
        const endPoint = coords[coords.length-1];

        const x1 = endPoint[1];
        const y1 = endPoint[0];

        const x2 = startPoint[1];
        const y2 = startPoint[0];

        const radians = Math.atan2((y1 - y2), (x1 - x2));

        const bearing = radians * (180 / Math.PI);
        // console.log(bearing);

        var coordNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
        var coordIndex = Math.round(bearing / 45);
        if (coordIndex < 0) {
            coordIndex = coordIndex + 8
        };

        // p['bearing'] = {
        //     value: bearing,
        //     name: coordNames[coordIndex]
        // };

        p.properties['bearingName'] = coordNames[coordIndex];
        // console.log(p);
        // console.log(p.bearing)

//         var y = Math.sin(dLon) * Math.cos(lat2);
// var x = Math.cos(lat1)*Math.sin(lat2) -
//         Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
// var brng = Math.atan2(y, x).toDeg();

        // console.log(p);
    })
}


// function drawPlayarea() {
//     const svg = d3.select("#play-area"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height");
    
//     const buildings = [{
//         id:'MH',
//         w: 183, 
//         h: 133,
//         r: 140,
//     }, {
//         id:'MFH',
//         w: 123,
//         h: 98,
//         r: 80
//     }];

//     const xOffset = width * 0.3;
//     const paddingY = 300;
//     const yOffset = 100;

//     var builds = svg
//     .selectAll(".building")
//     .data(buildings)
//     .attr('class', 'loaded')
//     .attr('style', (d, i) => `transform:translate(${xOffset}px, ${yOffset + (paddingY * i)}px); transform-origin:center;`)

//     const radius = 100;

//     const approxWidth = 183;
//     const approxHeight = 133;

//     var circ = svg
//     .selectAll(".shadow")
//     .data(buildings)
//     .enter().append('circle')
//     .attr('r', d => d.r)
//     .attr('class', 'shadow')
//     .attr('style', (d, i) => `transform:translate(${xOffset + d.w/2}px, ${yOffset + (paddingY * i) + d.h/2}px); transform-origin:center;`)
// }



function run(data) {
    pathData = data[0];
    buildingData = data[1];
    addCompassDirection();
    paths = pathData.features;

    addBuildingLayer(buildingData);

    selectedBuildings = allBuildings;
    map.setFilter("buildings-highlighted", ['in', 'Building_n', ...selectedBuildings]);

    addPathLayer(pathData);
    map.setFilter("paths-layer", ['in', 'id', '']);

    // beginAnimate();

    // registerClick();
    // registerEventListeners();
    // drawPlayarea();

}

function registerClick() {
    map.on('click', ev => {
        const clickedBuilds = map.queryRenderedFeatures(ev.point, { layers: ['buildings-layer'] });
        
        if (clickedBuilds.length > 0) {
            const bid = clickedBuilds[0].properties.Building_n;
            
            selectBuilding(bid);

            selectedPaths = pathData.features
                .filter(p => selectedBuildings.every(bid => p.properties.bids.includes(bid))) 
                .map(p => p.properties.id);

            

            map.setFilter("paths-layer", ['in', 'id', ...selectedPaths]);
        }
    });
}


