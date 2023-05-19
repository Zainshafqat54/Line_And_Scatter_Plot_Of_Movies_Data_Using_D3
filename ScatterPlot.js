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
    d.release_year >= 2000 &&
    d.release_year <= 2009 &&
    d.budget > 0 &&
    d.revenue > 0
    );
  });
}

function prepareScatterData(data) {
  // Prepare the data to plot, probably sorting.
  const dataArray = Array.from(data, d => ({
    revenue: d.revenue,
    budget: d.budget,
  }));
  return dataArray;
}
function formatTicks(d) {
  return d3
    .format('~s')(d)
    .replace('M', ' mil')
    .replace('G', ' bil')
    .replace('T', ' tril');
}
//You can add/write other functions if you want. 

// Main function.
function ready(movies) {
  console.log(movies);
  // Data prep.
  const moviesClean = filterData(movies);
  console.log(moviesClean);
  const data = prepareScatterData(moviesClean).sort((a, b) =>
  {return b.budget-a.budget})
  const dataset=data.slice(0,100);
  console.log(dataset);
  // Dimensions.
  const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    // Scales.
    

  // Draw base.
  var svg = d3.select("#scatterPlot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
	// svg
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
  // Draw header.
  
  // Draw x axis.
  var x = d3.scaleLinear()
    .domain([d3.min(dataset, function(d) {return d.budget; }), d3.max(dataset, function(d) {return d.budget; })])
    .range([20, width]);

  // Draw y axis.
  var y = d3.scaleLinear()
  .domain([0, d3.max(dataset, function(d) {return d.revenue; })+2000000000])
  .range([ height, 0]);
//draw hover
var tooltip = d3.select("#scatterPlot")
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
      .html("The exact value of<br>the budget its made is: " + d.budget)
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
	// try to explore as many styles as possible, for example 
	// .style('fill-opacity', 0.7);

  svg.append('g')
  .selectAll("dot")
  .data(dataset)
  .enter()
  .append("circle")
    .attr("cx", function (d) { return x(d.budget); } )
    .attr("cy", function (d) { return y(d.revenue); } )
    .attr("r", 3)
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
  .on("mouseleave", mouseleave )
    .style("fill", "red");

  const xAxis = d3
    .axisBottom(x)
    .tickFormat(formatTicks)
    .tickSizeInner(height)
    .ticks(3)
    .tickSizeOuter(10);

  svg.append("g")
  .attr("class","x axis")
  .call(xAxis);

    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width+25)
    .attr("y", height+12 )
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Budget")
    ;
     
    const yAxis = d3
    .axisLeft(y)
    .tickFormat(formatTicks)
    .ticks(6)
    .tickSizeInner(-width)
    .tickSizeOuter(0);


  svg.append("g")
    .call(yAxis);

    
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", 23)
    .attr("dy", ".75em")
    .style("font-size", "13px")
    .style("font-weight", "bold")
     .text("Revenue");

    }

// Load data.
d3.csv('data/movies.csv', type).then(res => {
  ready(res);
});