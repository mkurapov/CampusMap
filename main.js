const buildingArray = [
    'AA',
    'AB',
    'AU',
    // 'BS',
    // 'CC',
    // 'CCIT',
    // 'CD',
    // 'CH',
    // 'CHCP',
    // 'CR',
    // 'DC',
    // 'ED',
    // 'EEEL',
    // 'EN',
    // 'ES',
    // 'GL',
    // 'ICT',
    // 'IH',
    // 'KA',
    // 'KNA',
    // 'KNB',
    // 'MFH',
    // 'MH',
    // 'MLB',
    // 'MLT',
    'MS',
    // 'MSC',
    // 'OL',
    // 'OO',
    // 'PF',
    // 'RC',
    // 'RT',
    // 'RU',
    // 'SA',
    // 'SB',
    // 'SH',
    // 'SS',
    // 'ST',
    // 'TFDL',
    // 'TI',
    // 'YA'
    ];

const svg = d3.select("svg");
d3.csv('data/paths.csv').then(pathData => { 
    displayBuildings();

    const pathIds = pathData.map(row => row.Path_ID);
    pathIds.forEach(id => displayPath(id, pathData));
});

function displayBuildings() {
    const buildings = svg.selectAll('g')
    .data(buildingArray);

    buildings
        .merge(buildings)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', '3px')
        .attr('id', d => {
            // console.log(d);
            return d;
        });
}


function displayPath(pathId, pathData) {

    pathData = pathData.filter(row => row.Path_ID == pathId);
    // console.log(pathId);

    

    // const paths = svg.selectAll('circle')
    //     .data(pathData)
    //     .enter().append('circle')
    //     .attr("r", 3)
    //     .attr("cx", d => latToX(d.Lat))
    //     .attr("cy", d => longToY(d.Lon))

    // 7. d3's line generator

    const generatePath = d3.line()
                 .x(function(d) { return latToX(d['Lat']); })
                 .y(function(d) { return longToY(d['Lon']); });
   

    svg.append("path")
        .datum(pathData) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .attr("stroke", getRandomColor()) // Assign a class for styling 
        .attr("d", generatePath)
}


// function generatePath(row) {
//     console.log(row);
//     return  // apply smoothing to the line
// }


function latToX(lat) {
    lat = (+lat).toFixed(5);
    const magicNumber = 6844;
    const sub = lat.substring(4, lat.length);
    return sub - magicNumber;
}


function longToY(long) {
    console.log(long);
    long = (+long).toFixed(4);
    console.log(long);

    const magicNumber = 1029;
    const sub = long.substring(5, long.length);
    return sub - magicNumber;
}

function getRandomColor() {
    return "#"+((1<<24)*Math.random()|0).toString(16)
  }
  

// buildings.forEach(b => {
//     // console.log(b);
//     // d3.request(`/data/shapeFiles/${b}.svg`)
//     // .mimeType("image/svg+xml")
//     // // .response(responseCallback)
//     // .get();

//     d3.svg(`data/shapeFiles/${b}.svg`).then(buil => {
//         console.log(buil);

//         // svg.appendChild(node);
//         // console.log(node);
//     });
// });
