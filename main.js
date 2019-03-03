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
  }