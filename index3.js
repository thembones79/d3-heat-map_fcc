"use strict";

const title = `35 Fastest times up Alpe d'Huez`;

const svg = d3.select("svg");

const width = +svg.attr("width");
const height = +svg.attr("height");

const render = data => {
  const baseTemperature = data.baseTemperature;
  const xValue = d => d.year;
  const xAxisLabel = "Year";
  const yValue = d => d.month;
  const yAxisLabel = "Month";
  const temperature = d => d.variance + baseTemperature;
  const circleRadius = 9;
  const rectWidth = 10;
  const rectHeight = 30;
  const margin = { top: 50, right: 40, bottom: 120, left: 90 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const tooltip = d3
    .select(".chart")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.monthlyVariance, d => d.year),
      d3.max(data.monthlyVariance, d => d.year)
    ])
    .range([0, innerWidth])
    .nice();

  const yScale = d3
    .scaleBand()
    .domain(data.monthlyVariance.map(yValue))
    .range([0, innerHeight]);
  //  .nice();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const yAxisTickFormat = number =>
    d3
      .format(".0f")(number)
      .replace(number, months[number - 1]);

  const color = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain([
      d3.min(data.monthlyVariance, d => temperature(d)),
      d3.max(data.monthlyVariance, d => temperature(d))
    ]);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xAxis = d3
    .axisBottom(xScale)
   // .tickSize(-innerHeight)
    .tickPadding(2)
    .tickFormat(d3.format("d"));

  const yAxis = d3
    .axisLeft(yScale)
   // .tickSize(-innerWidth)
    .tickPadding(1)
    .tickFormat(yAxisTickFormat);

  const yAxisG = g
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis");

  // yAxisG.selectAll(".domain").remove();

  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -75)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(yAxisLabel);

  const xAxisG = g
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`);

  // xAxisG.select(".domain").remove();

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 65)
    .attr("x", innerWidth / 2)
    .text(xAxisLabel);

  g.selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "dot")
    .attr("y", d => yScale(yValue(d)))
    .attr("x", d => xScale(xValue(d)))
    .attr("width", rectWidth)
    .attr("height", yScale.bandwidth())
    .attr("data-xvalue", function(d) {
      return d.year;
    })
    .attr("data-yvalue", function(d) {
      return d.month;
    })
    .style("fill", d => color(d.variance + baseTemperature))
    .attr("opacity", "0.5")
    .on("mouseover", (d, i) => {
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          `
       <p><strong>Year: ${d.year}</strong>, Month: ${months[d.month - 1]}</p>
       <p>
       Change: ${d.variance},
       Temperature: ${temperature(d)}

       </p>

       `
        )
        .attr("data-year", d.year)
        .style("left", xScale(xValue(d)) + "px")
        .style("top", yScale(yValue(d)) + "px")
        .style("transform", `translate(130px,20px)`);
    })
    .on("mouseout", d => {
      tooltip.style("opacity", 0);
    });

  g.append("text")
    .attr("class", "title")
    .attr("y", -20)
    .attr("x", innerWidth / 2)
    .attr("text-anchor", "middle")
    .text(title);

  const legend = g
    .append("g")
    .attr("id", "legend")
    .style(
      "transform",
      `translate(550px,${innerHeight + margin.bottom - 10}px)`
    );

  legend.append("text").text("Legend:");

  legend
    .append("circle")
    .attr("cy", -circleRadius / 2)
    .attr("cx", 100)
    .style("fill", "red")
    .attr("r", circleRadius);

  legend
    .append("text")
    .attr("class", "legend")
    .text("doping")
    .style("transform", `translate(120px,0px)`);

  legend
    .append("circle")
    .attr("cy", -circleRadius / 2)
    .attr("cx", 200)
    .style("fill", "green")
    .attr("r", circleRadius);

  legend
    .append("text")
    .attr("class", "legend")
    .text("no doping")
    .style("transform", `translate(220px,0px)`);
};

/*


const colorLegend = (selection, props) => {
  const {
    colorScale,
    circleRadius,
    spacing,
    textOffset,
    backgroundRectWidth
  } = props;

  const backgroundRect = selection.selectAll("rect").data([null]);
  const n = colorScale.domain().length;
  backgroundRect
    .enter()
    .append("rect")
    .merge(backgroundRect)
    .attr("x", -circleRadius * 2)
    .attr("y", -circleRadius * 2)
    .attr("rx", circleRadius * 2)
    .attr("width", backgroundRectWidth)
    .attr("height", spacing * n + circleRadius * 2)
    .attr("fill", "white")
    .attr("opacity", 0.8);

  const groups = selection.selectAll(".tick").data(colorScale.domain());
  const groupsEnter = groups
    .enter()
    .append("g")
    .attr("class", "tick");
  groupsEnter
    .merge(groups)
    .attr("transform", (d, i) => `translate(0, ${i * spacing})`);
  groups.exit().remove();

  groupsEnter
    .append("circle")
    .merge(groups.select("circle"))
    .attr("r", circleRadius)
    .attr("fill", colorScale);

  groupsEnter
    .append("text")
    .merge(groups.select("text"))
    .text(d => d)
    .attr("dy", "0.32em")
    .attr("x", textOffset);
};



const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);


const g = svg.append("g");

const colorLegendG = svg.append("g").attr("transform", `translate(40,310)`);

g.append("path")
  .attr("class", "sphere")
  .attr("d", pathGenerator({ type: "Sphere" }));



const colorScale = d3.scaleOrdinal();

// const colorValue = d => d.properties.income_grp;
const colorValue = d => d.variance;

*/

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then(data => {
  console.log(data.monthlyVariance);
  /*
  data.forEach(d => {
    const splittedTime = d.Time.split(":");

    d.Time = new Date(2000, 1, 1, 0, splittedTime[0], splittedTime[1]);
    d.Year = +d.Year;




  }); */

  /*
  colorScale
    .domain(data.monthlyVariance.map(colorValue))
    .domain(
      colorScale
        .domain()
        .sort()
        .reverse()
    )
    .range(d3.schemeSpectral[colorScale.domain().length]);

  colorLegendG.call(colorLegend, {
    colorScale,
    circleRadius: 8,
    spacing: 20,
    textOffset: 12,
    backgroundRectWidth: 235
  });

  g.selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", pathGenerator)
    .attr("fill", d => colorScale(colorValue(d)))
    .append("title")
    .text(d => d.properties.name + ": " + colorValue(d));

*/

  render(data);
});
