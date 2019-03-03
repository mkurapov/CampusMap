<<<<<<< HEAD
const width = 1728;
const height = 1152;

const svg = d3.select("svg");

function getZoom() {
    return 150;
}

let zoomscale = 150;

var projection = d3.geoMercator()
  .scale(5800000)
  .center([-114.130583, 51.077945])
//   .translate([w / 2, h / 2])
  .translate([890, 540]);

//   51.077886, -114.130563

const path = d3.geoPath()
.projection(projection);

let tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip");

d3.csv("data/paths-test2.csv").then(pathData => {
//   svg.append("g")
//     .attr("class", "country")
//     .selectAll("path")
//     .data(data[0].features)
//     .enter().append("path")
//     .attr("d", path);
        const center = {
            Lon:-114.13563,
            Lat: 51.077886
        }
svg.selectAll(".meteor")
    .data(pathData)
    .enter().append("circle")
    .attr("class", "meteor")
    .attr("cx", (d,i) => {
        // console.log([d.Lat, d.Lon]);
        let coords = projection([+d.Lon, +d.Lat]);
        // console.log(coords);
    return coords[0];
    })
    .attr("cy", (d) => {
    let coords = projection([+d.Lon, +d.Lat]);
    return coords[1];
    })
    .attr("r", 10);
});
var zoom = d3.zoom().on("zoom", zoomed);


svg
    .call(zoom);


function zoomed() {
    zoomscale = d3.event.transform.k * 1000;
=======
const buildingArray = [
'AA','AB','AU','BS','CC','CCIT','CD','CH','CHCP','CR','DC','ED','EEEL','EN','ES','GL','ICT','IH','KA','KNA','KNB','MFH','MH','MLB','MLT','MS','MSC','OL','OO','PF','RC','RT','RU','SA','SB','SH','SS','ST','TFDL','TI','YA' ];

const svg = d3.select("svg");

function latToX(lat) {
    lat = (+lat).toFixed(5);
    const magicNumber = 6844;
    const sub = lat.substring(4, lat.length);
    return sub - magicNumber;
}

function longToY(long) {
    long = (+long).toFixed(4);
    const magicNumber = 1029;
    const sub = long.substring(5, long.length);
    return sub - magicNumber;
}

d3.csv('data/paths-2015.csv').then(pathData => { 
    displayBuildings();
    setTimeout(() => drawPaths(pathData), 1000);
});

function drawPaths(pathData) {
    const curId = pathData[0].Path_ID;
    let reducer = {
        id: curId,
        coords: []
    };

    pathData.forEach(row => { 
        if (row.Path_ID != reducer.id) {
            displayPath(reducer);
            // setTimeout(displayPath, 0, reducer);
            
            reducer = {
                id: row.Path_ID,
                coords: []
            };
        }
        reducer.coords.push({
            x: latToX(row.Lat),
            y: longToY(row.Lon)
        });
    });
}

function displayBuildings() {
    const buildings = svg.selectAll('g')
        .data(buildingArray);

    buildings
        .merge(buildings)
        .attr('class', 'building')
        .attr('id', d => d)
        .on('mouseover', function() {
            // console.log(d3.select(this).attr('id'))
        });
}

const generatePath = d3.line()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; });

function displayPath(pathData) {   
    const coords = pathData.coords;
    const randCol = getRandomColor();

    svg.selectAll('circle')
        .data(coords)
        .enter().append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 4)
        .attr('fill', randCol);

    const path = svg.append("path")
        .datum(coords)
        .attr("class", "line") 
        .attr("stroke", randCol) 
        .attr("d", generatePath);

    const totalLength = path.node().getTotalLength();

    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(3000)
        .attr("stroke-dashoffset", 0);
}



function getRandomColor() {
    return "#"+((1<<24)*Math.random()|0).toString(16)
>>>>>>> 81ecbb66a336c312dd99949213d7e9cbaae818ef
  }