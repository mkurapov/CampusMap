const width = 1728;
const height = 1152;

const svg = d3.select("svg");

var projection = d3.geoMercator()
  .scale(5580000)
  .center([-114.130583, 51.077945])
  .translate([885, 580]);

const path = d3.geoPath()
    .projection(projection);

const buildingArray = [
    'AA','AB','AU','BS','CC','CCIT','CD','CH','CHCP','CR','DC','ED','EEEL','EN','ES','GL','ICT','IH','KA','KNA','KNB','MFH','MH','MLB','MLT','MS','MSC','OL','OO','PF','RC','RT','RU','SA','SB','SH','SS','ST','TFDL','TI','YA' ];
    
d3.json('data/paths.json').then(pathData => { 
    displayBuildings();
    massageData(pathData);
    // setTimeout(() => drawPaths(pathData), 1000);
});

function massageData(pathData) {
    const cleanData = [];

    const curId = pathData[0].Path_ID;
    let reducer = {
        id: curId,
        coords: [],
        startTime: '',
        endTime: ''
    };

    pathData.forEach((row, i) => { 
        if (row.Path_ID != reducer.id || pathData.length - 1 == i) {
            cleanData.push(reducer);
            reducer = {
                id: row.Path_ID,
                coords: [],
                startTime: '',
                endTime: ''
            };
        }

        reducer.coords.push({
            x: projection([row.Lon,row.Lat])[0],
            y: projection([row.Lon,row.Lat])[1],
        });
        
    });

    console.log(cleanData);
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
    console.log(coords);
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


