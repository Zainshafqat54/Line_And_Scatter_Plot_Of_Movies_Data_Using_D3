const parseDate = string => d3.utcParse('%Y-%m-%d')(string);
const parseNA = string => (string === 'NA' ? undefined : string);

function type(d) {
  const date = parseDate(d.release_date);

  return {
    budget: +d.budget,
    release_date: date,
    release_year: date.getFullYear(),
    revenue: +d.revenue
  };
}

// Data utilities,
function filterData(data) {
  return data.filter(d => {
    return (
      // Write code for filtering data for year 2000 - 2009
	  // Write code for budget and revenue amount greater than 0
    
    d.release_year > 1999 &&
    d.release_year < 2010 &&
    d.budget > 0 &&
    d.revenue > 0
    );
  });
}

function sortOnKeys(dict) {

  var sorted = [];
  for(var key in dict) {
      sorted[sorted.length] = key;
  }
  sorted.sort();

  var tempDict = {};
  for(var i = 0; i < sorted.length; i++) {
      tempDict[sorted[i]] = dict[sorted[i]];
  }

  return tempDict;
}
function changeType(barChartData){
    let D = {};
  Object.keys(barChartData[0]).forEach(k => {
      D[k] = barChartData.map(o => o[k]);
  });
  let N = {};
  Object.keys(D.value[0]).forEach(k => {
    N[k] = D.value.map(o => o[k]);
  });
  N["Year"]=D.key;
  return N;
}

function formatTicks(d) {
  return d3
    .format('~s')(d)
    .replace('M', ' mil')
    .replace('G', ' bil')
    .replace('T', ' tril');
}
function prepareLineChartData(data) {
  
  // Group by year and extract revenue and budget.
  const arr =  Array.from(data, d => ({
    revenue: d.revenue,budget: d.budget,release_year: d.release_year}));
  // Convert rolled up maps to to arrays.
  var dt = d3.nest()
  .key(function(d) { return d.release_year; })
  .rollup(function(v) { 
      return {
      revenue: d3.sum(v, function(d) { return d.revenue; }),
      budget: d3.sum(v, function(d) { return d.budget; })
    };  
 
  }).entries(arr);
  return dt;
}

// Main function.
function ready(movies) {
  // Data prep.
  const moviesClean = filterData(movies);
  const dataset = prepareLineChartData(moviesClean).sort(function(x, y){
    return d3.ascending(x.key, y.key);
 });
  //const LineChartData=changeType(dataset);
  var LineChartData=[];
  const size=dataset.length;
for(let i = 0; i < size; i++)
{
 var tempArr = {};
  tempArr["year"]=+dataset[i].key;
  tempArr["revenue"]=dataset[i].value.revenue;
  tempArr["budget"]=dataset[i].value.budget;
  LineChartData.push(tempArr);
}
  console.log(LineChartData);
  console.log(moviesClean);
  // Dimensions.
  const margin = {top: 10, right: 30, bottom: 30, left: 60},
  width = 760- margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
  const title = 'Budget and Revenue over time in $US';
  var svg = d3.select("#linePlot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

          const header = svg
          .append('g')
          .attr('class', 'bar-header')
          .attr('transform', `translate(0,${-margin.top * -1})`)
          .append('text');
      
        header.append('tspan').text('Total Popularity by genre in US')
        .attr('x', 160)
        .style('font-size', '0.8em');
      
        header
          .append('tspan')
          .attr('x', 170)
          .attr('dy', '1.5em')
          .style('font-size', '0.6em')
          .style('fill', '#555')
          .style('text-align', 'center')
          .text('Films w/ P0pularity figures, 2000-2009');


  
  var x = d3.scaleLinear()
    .domain([d3.min(LineChartData, function(d) {return d.year; }), d3.max(LineChartData, function(d) {return d.year; })])
    .range([10, width]);

  // Draw y axis.
  var y = d3.scaleLinear()
  .domain([0, d3.max(LineChartData, function(d) {return d.revenue; })])
  .range([ height, 0]);
// draw hover
var tooltip = d3.select("#linePlot")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")


  var mouseover = function(d) {
    tooltip
      .style("opacity", 100)
      .select("circle")
      .style("fill","blue")
  }

  var mousemove = function(d) {
    tooltip
      .html("The exact value of<br>the revenue its made is: " + d.revenue)
      .style("left", (d3.mouse(this)[0]+90) + "px") 
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouse = function(d) {
    tooltip
      .html("The exact value of<br>the Budget its made is: " + d.budget)
      .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }
// Draw scatter.
  svg.append('g')
  .selectAll("dot")
  .data(LineChartData)
  .enter()
  .append("circle")
    .attr("cx", function (d) { return x(d.year); } )
    .attr("cy", function (d) { return y(d.revenue); } )
    .attr("r", 5)
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
  .on("mouseleave", mouseleave )
    .style("fill", "red");
  svg.append('g')
    .selectAll("dot")
    .data(LineChartData)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.year); } )
      .attr("cy", function (d) { return y(d.budget); } )
      .attr("r", 5)
      .on("mouseover", mouseover )
    .on("mousemove", mouse )
  .on("mouseleave", mouseleave )
      .style("fill", "blue");

  const xAxis = d3
    .axisBottom(x)
    .ticks(10)
    .tickSizeInner(height)
    .tickSizeOuter(0);

  svg.append("g")
  .attr("class","x axis")
    .call(xAxis);

    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width+20)
    .attr("y", height-20 )
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Year");

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x",0)
    .attr("y",30)
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Price");

    svg.append('line') 
    .style("stroke", "black") 
    .style("stroke-width", 1) 
    .attr("x1", 0) 
    .attr("y1", height) 
    .attr("x2", width) 
    .attr("y2", height);
    
    const yAxis = d3
    .axisLeft(y)
    .tickFormat(formatTicks)
    .ticks(6)
    .tickSizeInner(-width)
    .tickSizeOuter(0);


  svg.append("g")
    .call(yAxis);

    
    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 650)
    .attr("y", 80)
    .attr("dy", ".75em")
    .style("font-size", "15px")
     .text("Revenue");

     svg.append("text")
     .attr("text-anchor", "end")
     .attr("x", 650)
     .attr("y", 320)
     .attr("dy", ".75em")
     .style("font-size", "15px")
      .text("Budget");

     var line = d3.line()
        .x(function(d) { return xScale(d.year); }) 
        .y(function(d) { return yScale(d.revenue); })
        .curve(d3.curve);
      
      // Add the valueline path.
    svg.append("path")
    .attr("class", "line")
    .attr("d", linefunc(LineChartData));

}
// Load data.
d3.csv('data/movies.csv', type).then(res => {
  ready(res);
});