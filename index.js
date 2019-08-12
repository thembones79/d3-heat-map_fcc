"use strict";

const title = `1753 - 2015: base temperature 8.66°C`;
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const render = data => {
  const baseTemperature = data.baseTemperature;
  const xValue = d => d.year;
  const xAxisLabel = "Year";
  const yValue = d => d.month-1;
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
      .replace(number, months[number]);

  const colorScale = d3
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
    .attr("class", "cell")
    .attr("y", d => yScale(yValue(d)))
    .attr("x", d => xScale(xValue(d)))
    .attr("width", rectWidth)
    .attr("height", yScale.bandwidth())
    .attr("data-year", function(d) {
      return d.year;
    })
    .attr("data-month", function(d) {
      return d.month-1;
    })
    .attr("data-temp", function(d) {
      return temperature(d);
    })
    .style("fill", d => colorScale(temperature(d)))

    .on("mouseover", (d, i) => {
      tooltip.style("opacity", 0.8);
      tooltip
        .html(
          `
       <p class="smaller_text">
       <strong>
       ${months[d.month - 1]}, ${d.year}
       </strong>
       </p>
       <p class="bigger_text">
       <strong>
       ${d3.format(".2f")(temperature(d))}°C
       </strong>
       </p>
       <p class="smaller_text">
       (Change: ${d3.format(".2f")(d.variance)}°C)
       </p>
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
    .tickPadding(2)
    .ticks(20)
    .tickFormat(d3.format("d"));

  const yAxis = d3
    .axisLeft(yScale)
    .tickPadding(1)
    .tickFormat(yAxisTickFormat);

  const yAxisG = g
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis");

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

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 45)
    .attr("x", innerWidth / 2)
    .text(xAxisLabel);

  g.append("text")
    .attr("class", "title")
    .attr("id", "description")
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
    .style("fill", d => colorScale(d));

  const legendAxisTickFormat = number =>
    d3
      .format(".0f")(number)
      .replace(number, number + "°C");

  const legendAxis = d3
    .axisBottom(legendScale)
    .tickPadding(2)
    .tickFormat(legendAxisTickFormat);

  const legendAxisG = g
    .append("g")
    .call(legendAxis)
    .attr("id", "legend-axis")
    .attr("transform", `translate(150,${innerHeight + 100})`);
};

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then(data => {
  render(data);
});
