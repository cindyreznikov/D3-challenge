var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group - g (graphic group) tag - shift by margins.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params for both axis
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {

  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
};

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[chosenYAxis])])
      .range([height, 0]);
  
    return yLinearScale;
};    

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
};

// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
 
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
};

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
};

// function used for updating state text group with a transition to
// new data
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return textGroup;
  };

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelXtip;
  
  switch(chosenXAxis) {
    case "poverty":
      labelXtip = "Poverty: ";
      break;
    case "age":
      labelXtip = "Age (Median): ";
      break;
    case "income":
      labelXtip = "Household Income (Median): $";
         
  };

  var labelYtip;

  switch(chosenYAxis) {
    case "healthcare":
      labelYtip = "Lacks Healthcare: ";
      break;
    case "smokes":
      labelYtip = "Smokes: ";
      break;
    case "obesity":
      labelYtip = "Obesity: ";
           
    };

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelXtip} ${d[chosenXAxis]}<br>${labelYtip} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // on mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare= +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    abbr = data.abbr;
  });

  // LinearScale functions above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis 
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles to the new circle
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "#08326e")
    .attr("opacity", ".5");
    
    console.log("x and y linear scale here")
    console.log(xLinearScale)
    console.log(yLinearScale)
    console.log(circlesGroup)

  // put state abbreviation inside circles
  var textGroup = chartGroup.selectAll("taylor")
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => d.abbr)
    .attr("font-size", "8px");
    // .html(function(d) {return (`${d.abbr}`)});

    console.log("textGroup:")
    console.log(textGroup)

    // Create group for three x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for three y-axis labels
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2));

  var healthcareLabel = labelsGroupY.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2)) 
    .attr("dy", "3em")
    .attr("value", "healthcare") // value to grab for event listener    
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsGroupY.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))  
    .attr("dy", "2em")
    .attr("value", "smokes") // value to grab for event listener    
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = labelsGroupY.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))  
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener    
    .classed("inactive", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
       var value = d3.select(this).attr("value");

        // changes classes to change bold text and update chosen axis
        console.log( "x axis clicked")
        console.log(value)
        switch(value) {
            case "poverty":
              chosenXAxis = value
              povertyLabel
                .classed("active", true)
                .classed("inactive", false)
              ageLabel 
                .classed("active", false)
                .classed("inactive", true)
              incomeLabel
                .classed("active", false)
                .classed("inactive", true)
              break;
            case "age":
              chosenXAxis = value
              ageLabel 
                .classed("active", true)
                .classed("inactive", false)
              incomeLabel
                .classed("active", false)
                .classed("inactive", true)
              povertyLabel
                .classed("active", false)
                .classed("inactive", true)
              break;
            case "income":
              chosenXAxis = value  
              incomeLabel
                .classed("active", true)
                .classed("inactive", false)
              ageLabel 
                .classed("active", false)
                .classed("inactive", true)
              povertyLabel 
                .classed("active", false)
                .classed("inactive", true);
        }      

        console.log(chosenXAxis);
      
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);
       
        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);
      
        // updates circles with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // updates state text with new values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
    })    

  // y axis labels event listener
  labelsGroupY.selectAll("text")
    .on("click", function() {
        var value = d3.select(this).attr("value");

        // changes classes to change bold text and update chosen axis
        console.log( "y axis clicked")
        console.log(value)
        switch(value) {
            case "healthcare":
                chosenYAxis = value   
                healthcareLabel
                .classed("active", true)
                .classed("inactive", false)
                smokesLabel 
                .classed("active", false)
                .classed("inactive", true)
                obesityLabel
                .classed("active", false)
                .classed("inactive", true)
                break;
            case "smokes":
                chosenYAxis = value 
                smokesLabel 
                .classed("active", true)
                .classed("inactive", false)
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true)
                obesityLabel
                .classed("active", false)
                .classed("inactive", true)
                break;
            case "obesity":
                chosenYAxis = value   
                obesityLabel
                .classed("active", true)
                .classed("inactive", false)
                smokesLabel 
                .classed("active", false)
                .classed("inactive", true)
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
        }        
        console.log(chosenYAxis);

        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);
        
        // updates y axis with transition
        yAxis = renderAxesY(yLinearScale, yAxis);
        
        // updates circles with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
              
        // updates state text with new values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);        
    }); 
              
}).catch(function(error) {
  console.log(error);
});
