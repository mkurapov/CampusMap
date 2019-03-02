const buildingArray = [
    'AA','AB','AU','BS','CC','CCIT','CD','CH','CHCP','CR','DC','ED','EEEL','EN','ES','GL','ICT','IH','KA','KNA','KNB','MFH','MH','MLB','MLT','MS','MSC','OL','OO','PF','RC','RT','RU','SA','SB','SH','SS','ST','TFDL','TI','YA' ];

const svg = d3.select("svg");
d3.csv('data/paths-2013.csv').then(pathData => { 
    displayBuildings();
    

    const pathIds = pathData.map(row => row.Path_ID);
    pathIds.forEach(id => displayPath(id, pathData.filter(row => row.Path_ID == id)));
});

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
    .x(function(d) { return latToX(d.Lat); })
    .y(function(d) { return longToY(d.Lon); });

function displayPath(pathId, pathData) {   
    const path = svg.append("path")
    .datum(pathData)
    .attr("class", "line") 
        .attr("stroke", getRandomColor()) 
        .attr("d", generatePath)

    const totalLength = path.node().getTotalLength();

    path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
        .duration(3000)
        // .ease("linear")
        .attr("stroke-dashoffset", 0);
}

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

function getRandomColor() {
    return "#"+((1<<24)*Math.random()|0).toString(16)
  }