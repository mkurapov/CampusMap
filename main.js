const width = 1728;
const height = 1152;

const svg = d3.select("svg");

var projection = d3.geoMercator()
  .scale(5800000)
  .center([-114.130583, 51.077945])
  .translate([890, 540]);

const path = d3.geoPath()
    .projection(projection);

const buildingArray = [
    'AA','AB','AU','BS','CC','CCIT','CD','CH','CHCP','CR','DC','ED','EEEL','EN','ES','GL','ICT','IH','KA','KNA','KNB','MFH','MH','MLB','MLT','MS','MSC','OL','OO','PF','RC','RT','RU','SA','SB','SH','SS','ST','TFDL','TI','YA' ];
    
d3.csv('data/paths-2013.csv').then(pathData => { 
    displayBuildings();
    setTimeout(() => drawPaths(pathData), 1000);
});

function drawPaths(pathData) {
    const curId = pathData[0].Path_ID;
    let reducer = {
        id: curId,
        coords: []
    };

    pathData.forEach((row, i) => { 
        console.log('row number:', i);
        if (row.Path_ID != reducer.id) {
            displayPath(reducer);
            
            reducer = {
                id: row.Path_ID,
                coords: []
            };
        }
        reducer.coords.push({
            x: projection([row.Lon,row.Lat])[0],
            y: projection([row.Lon,row.Lat])[1],
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
                    .y(function(d) { return d.y; })
                    // .curve(d3.curveCardinal);

function displayPath(pathData) {   
    const coords = pathData.coords;
    // console.log(coords);
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
}


