const w = 1728;
const h = 1152;

const svg = d3.select(".map")
.append("svg")
.attr("height", h)
.attr("width", w);

var projection = d3.geoAzimuthalEqualArea()
  .scale(9999999)
  .center([-114.134352, 51.078010])
  .translate([480, 250]);

var geoGenerator = d3.geoPath()
  .projection(projection);

const path = d3.geoPath()
.projection(projection);

let tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip");

const files = ["data/calgary.geojson"];

Promise.all(files.map((url) => d3.json(url))).then(function(data) {

  d3.csv("data/paths-test.csv").then(pathData => {
      svg.append("g")
        .attr("class", "country")
        .selectAll("path")
        .data(data[0].features)
        .enter().append("path")
        .attr("d", path);
         
    svg.selectAll(".meteor")
      .data(pathData)
      .enter().append("circle")
      .attr("class", "meteor")
      .attr("cx", (d,i) => {
          console.log([d.Lat, d.Lon]);
          let coords = projection([+d.Lon, +d.Lat]);
          console.log(coords);
        return coords[0];
      })
      .attr("cy", (d) => {
        let coords = projection([+d.Lon, +d.Lat]);
        return coords[1];
      })
      .attr("r", 6);
  });
});