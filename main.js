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

d3.csv('data/paths.csv').then(data => run(data))

function run(pathData) {
    const buildings = svg.selectAll('g')
    .data(buildingArray);

buildings
    // .remove()
    // .merge()
    .merge(buildings)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', '3px')
    .attr('id', d => {
        console.log(d);
        return d;
    })

const paths = svg.selectAll('circle')
    .data(pathData)
    .enter().append('circle')
    .attr("r", 3)
    .attr("cx", d => latToX(d.Lat))
    .attr("cy", d => longToY(d.Lon))
}

function latToX(lat) {
    const magicNumber = 6844;
    const sub = lat.substring(4, lat.length);
    if (sub.length > 1) { 
        return sub - magicNumber;
    } 
    return 8000 - magicNumber;
}


function longToY(long) {
    const magicNumber = 1029;
    const sub = long.substring(5, long.length);
    return sub - magicNumber;
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
