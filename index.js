"use strict";

const title = `1753 - 2015: base temperature 8.66°C`;

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

  const rectWidth = 10;

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
    .range([0, innerWidth]);
  // .nice();

  const yScale = d3
    .scaleBand()
    .domain(data.monthlyVariance.map(yValue))
    .range([0, innerHeight]);

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
    .scaleSequential(d3.interpolateSpectral)
    .domain([
      d3.max(data.monthlyVariance, d => temperature(d)),
      d3.min(data.monthlyVariance, d => temperature(d))
    ]);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

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

    .on("mouseover", (d, i) => {
      tooltip.style("opacity", 0.8);
      tooltip
        .html(
          `
       <p class="smaller_text"><strong>${months[d.month - 1]}, ${
            d.year
          }</strong></p>
       <p class="bigger_text"><strong>${d3.format(".2f")(
         temperature(d)
       )}°C</strong></p>
       <p class="smaller_text">(Change: ${d3.format(".2f")(d.variance)}°C)</p>
       `
        )
        .attr("data-year", d.year)
        .style("left", xScale(xValue(d)) + "px")
        .style("top", yScale(yValue(d)) + "px")
        .style("transform", `translate(135px,95px)`);
    })
    .on("mouseout", d => {
      tooltip.style("opacity", 0);
    });

  const xAxis = d3
    .axisBottom(xScale)
    // .tickSize(-innerHeight)
    .tickPadding(2)
    .ticks(20)
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
    .attr("y", 45)
    .attr("x", innerWidth / 2)
    .text(xAxisLabel);

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
      `translate(300px,${innerHeight + margin.bottom - 20}px)`
    );

  legend.append("text").text("Legend:");

  const legendGenerator = n => {
    let legendArr = [];
    const maxVal = d3.max(data.monthlyVariance, d => temperature(d));
    const minVal = d3.min(data.monthlyVariance, d => temperature(d));
    const valueLength = maxVal - minVal;
    const chunk = valueLength / n;
    for (let i = 0; i < n; i++) {
      legendArr.push(minVal + i * chunk);
    }
    return legendArr;
  };

  const legendData = legendGenerator(1000);

  const zScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.monthlyVariance, d => temperature(d)),
      d3.max(data.monthlyVariance, d => temperature(d))
    ])
    .range([250, 600]);
  // .nice();

  const legendScale = d3
    .scaleLinear()
    .domain([d3.min(legendData), d3.max(legendData)])
    .range([250, 700])
    .nice();

  legend
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "dot")
    .attr("y", -18)
    .attr("x", d => legendScale(d) - 165)
    .attr("width", rectWidth)
    .attr("height", yScale.bandwidth() / 2)
    .style("fill", d => color(d));

  const legendAxisTickFormat = number =>
    d3
      .format(".0f")(number)
      .replace(number, number + "°C");

  const legendAxis = d3
    .axisBottom(legendScale)
    // .tickSize(-innerHeight)
    .tickPadding(2)
    .tickFormat(legendAxisTickFormat);
  //.ticks(8)

  const legendAxisG = g

    .append("g")
    .call(legendAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(150,${innerHeight + 100})`);

  // xAxisG.select(".domain").remove();
};

/*

const colorScale = d3.scaleOrdinal();


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
