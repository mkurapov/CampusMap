mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cmFwb3YiLCJhIjoiY2p0aGo5NW0yMGZnaDN5cGY4NWVoeGt5ZiJ9.IdfRD2MhG562b2oct7daNw';
const allBuildings = ["GS","MF","OO","TRA","SH","KNB","MFH","CC","ST","EN","EEEL","AB","DC","RC","TFDL","EDC","EDT","TI","BI","TRB","EN","IH","OL","CD","GL","HP","YA","KA","PP","RU","CDC","WS","VC","VC","CR","15BI","15PF","EDT","AU","15TFDL","EN","AD","PF","MT","MB","CH","RT","KNA","MSC","MH","CCIT","ICT","ES","SB","SS","SA","MS","TFDL2"];

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mkurapov/cjtp3qjvh8bcf1foc9kfzj9ep',
    center: [-114.13068262984046, 51.07796392436677],
    zoom: 15.45,
    container: 'map'
});

map.on('load', () => {
    Promise.all([
        d3.json('/data/geopaths.json'), 
        d3.json('/data/buildings.json')]).then(data => run(data))
});

document.addEventListener('keydown', function(event) {
    if (event.key == '1') {
        // console.log(map.getCenter())
        // selectedBuildings = selectedPaths = [];
        // map.setFilter("buildings-highlighted", ['in', 'id', ...selectedBuildings]);
        // map.setFilter("paths-highlighted", ['in', 'id', ...selectedPaths]);
        console.log(map.getZoom());
        console.log(map.getCenter());
    }    
});


const pauseButton = document.getElementById('pause');
const timeEl = document.getElementById('time');
const knobs = document.getElementsByClassName('svg-container');
const slider = document.getElementById('slider');

let pathData;
let buildingData;
let paths;
let currentPathIndex = 0;

let speedFactor = 1000; // number of frames per longitude degree
let animation; // to store and cancel the animation
let startTime = 0;
let progress = 0; // progress = timestamp - startTime
const timePerPath = 10;
let resetTime = false; // indicator of whether time reset is needed for the animation

let selectedBuildings = [];
let selectedPaths = [];

let currentHour = 12;

function animateLine(timestamp) {
    progress = timestamp - startTime;

    let isDrawing = false;
    if (progress < timePerPath) {
       
    } else {
        startTime = performance.now();
        isDrawing = true;
    }

    if (isDrawing) {
        updateTime(currentHour++);
        isDrawing = false;
    }
    
    animation = requestAnimationFrame(animateLine);
}

function updateTime(hour) {
    // console.log(paths);
    currentHour = hour;
    const pathIds = pathData.features
            .filter(p => {
                const pathHour = parseInt(p.properties.startTime.slice(0,2));
                return pathHour == hour;
            })
            .map(p => p.properties.id);
            

    map.setFilter("paths-layer", ['in', 'id', ...pathIds]);
    
    let date = new Date();
    date.setHours(hour);
    date.setMinutes(0);
    timeEl.textContent = date.toTimeString().slice(0, 5);
}

function registerEventListeners() {

    pauseButton.addEventListener('click', () => {
        pauseButton.classList.toggle('pause');
        if (pauseButton.classList.contains('pause')) {
            console.log('run');
            cancelAnimationFrame(animation);
        } else {
            resetTime = true;
            animateLine();
        }
    });

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
    // pathData.features = [];
    // console.log(map.getSource('paths-'))
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

        p.properties['bearingName'] = coordNames[coordIndex];
    })
}

function run(data) {
    pathData = data[0];
    buildingData = data[1];
    addCompassDirection();
    paths = pathData.features;
    addBuildingLayer(buildingData);

    // selectedBuildings = allBuildings;
    map.setFilter("buildings-highlighted", ['in', 'Building_n', ...selectedBuildings]);

    // pathData.features = []

    addPathLayer(pathData);
    map.setFilter("paths-layer", ['in', 'id', '']); // remove lines initially
    // registerEventListeners();
    map.on('click', ev => {
        // can also just do an intersection of layres instead of storing bid's
        const clickedBuilds = map.queryRenderedFeatures(ev.point, { layers: ['buildings-layer'] });

        // const visiblePathIds = map.queryRenderedFeatures({layers: ['paths-layer']}).map(p => p.properties.id);

    
        if (clickedBuilds.length > 0) {
            const bid = clickedBuilds[0].properties.Building_n;
            selectBuilding(bid);
            console.log(bid);

            const pathIds = pathData.features
                .filter(p => selectedBuildings.every(bid => p.properties.bids.includes(bid))) // !some is for uncover and will all buildings
                // .filter(p => visiblePathIds.includes(p.properties.id)) // only highlight visible paths
                .map(p => p.properties.id);

            map.setFilter("paths-layer", ['in', 'id', ...pathIds]);
        }
    });
}