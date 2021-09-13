const width = 1200,
height = 570,
padding = {
  top: 120,
  bottom: 75,
  left: 95,
  right: 75 };


const svg = d3.select('#dataviz').
append('svg').
attr('height', height + padding.top + padding.bottom).
attr('width', width + padding.left + padding.right);

const tooltip = d3.select('#dataviz').
append('div').
attr('id', 'tooltip').
style('opacity', 0).
style('position', 'absolute').
style('background-color', 'white').
style('padding', '8px').
style('border-radius', '3px').
style('border', '1px solid grey');


const JSON_EDUCATION = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const JSON_COUNTY = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const promises = [d3.json(JSON_EDUCATION), d3.json(JSON_COUNTY)];
const myDataPromises = Promise.all(promises);

myDataPromises.then(data => {
  const dataCounty = data[1];
  const dataEducation = data[0];
  // console.log(dataCounty == data[1])

  // d3.queue()
  //   .defer(d3.json, JSON_COUNTY)
  //   .defer(d3.json, JSON_EDUCATION)
  //   .await(ready)

  // function ready(error, dataCounty, dataEducation) {
  //   if (error) {
  //     throw error
  //   }

  const geoJson = topojson.feature(dataCounty, dataCounty.objects.counties);
  const maxEducation = d3.max(dataEducation.map(d => d.bachelorsOrHigher)),
  minEducation = d3.min(dataEducation.map(d => d.bachelorsOrHigher));
  // console.log(maxEducation, minEducation)

  const colorScale = d3.scaleSequential().
  domain([minEducation, maxEducation]).
  interpolator(d3.interpolateRgb('white', 'blue'));
  // console.log(colorScale(maxEducation))
  // const projection = d3.geoAlbersUsa()
  // .translate([width/2, height/2]) 
  // .scale([100]); 
  const path = d3.geoPath();

  const educationByFip = d => {
    return dataEducation[dataEducation.map(county => county.fips).indexOf(d)].bachelorsOrHigher;
  };
  const eduDataByFip = d => {
    return dataEducation[dataEducation.map(county => county.fips).indexOf(d)];
  };

  // console.log(eduDataByFip(1011))
  const chloroplethUsa = svg.append('g').
  attr('id', 'choropleth');

  chloroplethUsa.selectAll('path').
  data(geoJson.features).
  enter().
  append('path').
  attr('class', 'county').
  attr('data-fips', d => d.id).
  attr('data-education', d => educationByFip(d.id) ? educationByFip(d.id) : "no data").
  attr('d', path).
  attr('stroke', 'black').
  attr('fill', d => colorScale(educationByFip(d.id) ? educationByFip(d.id) : 'black')).
  attr('transform', `translate(${padding.left},${padding.top})`).
  on('mouseover', (e, i) => {
    tooltip.transition().
    duration(200).
    style('opacity', .9).
    style('left', e.pageX + 40 + 'px').
    style('top', e.pageY - 50 + 'px');
    tooltip.html(eduDataByFip(i.id).area_name + ", " + eduDataByFip(i.id).state + ':<br>' + (eduDataByFip(i.id).bachelorsOrHigher ? eduDataByFip(i.id).bachelorsOrHigher.toFixed(1) : 'no data') + "%").

    attr('data-education', eduDataByFip(i.id).bachelorsOrHigher ? eduDataByFip(i.id).bachelorsOrHigher.toFixed(1) : 'no data');

  }).
  on('mouseout', () => {
    tooltip.transition().
    duration(200).
    style('opacity', 0);
  });



  chloroplethUsa.append('text').
  attr('id', 'title').
  attr('text-anchor', 'middle').
  attr('x', 575).
  attr('y', padding.top / 2).
  text('Educational Attainment in US by County').
  style('font-size', '32px');

  chloroplethUsa.append('text').
  attr('id', 'description').
  text(`Percentage of adults age 25 and older with a bachelor's degree or higher
    (2010-2014)`).
  attr('text-anchor', 'middle').
  attr('x', 575).
  attr('y', padding.top * .75).
  style('font-size', '18px');

  const legendWidth = 300,
  legendHeight = 20,
  legendTicks = 8,
  legendRange = d3.range(minEducation, maxEducation, (maxEducation - minEducation) / legendTicks);

  const svgLegend = chloroplethUsa.append('g').
  attr('id', 'legend').
  style('border', '1px solid black').
  attr('transform', `translate(${575 - legendWidth / 2},${padding.top * .85})`);

  const legendScale = d3.scaleLinear().
  domain([minEducation, maxEducation]).
  range([0, legendWidth]);

  const legendThreshold = d3.scaleThreshold().
  domain(legendRange).
  range(["rgb(0, 0, 0)", ...legendRange.map(d => colorScale(d)), "rgb(0, 0, 0)"]);

  svgLegend.selectAll('rect').
  data(legendRange).
  enter().
  append('rect').
  attr('class', 'legend-bar').
  style('border', '1px solid black').
  attr('height', legendHeight).
  attr('width', legendWidth / legendTicks).
  attr('x', (d, i) => i * legendWidth / legendTicks).
  style('fill', d => legendThreshold(d));

  const legendKey = svgLegend.append('g').
  attr('transform', `translate(0,${legendHeight})`).
  call(d3.axisBottom(legendScale).
  tickFormat(d => d.toFixed(1) + '%').
  tickValues([...legendRange, maxEducation]));


  // console.log(legendRange)




});

// const colorScale = d3.scaleSequential()
//     .domain([ minEducation , maxEducation ])
//     .interpolator(d3.interpolateRgb('white', 'blue'))