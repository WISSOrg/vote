
var pathname = location.pathname;
if (pathname.substr(-1) === '/') pathname = pathname.substring(0, pathname.length-1);
var rootDir = pathname.substring(0, pathname.length-'/stats'.length);

var interval = 2000, data = [], viewData;

$('.interval').text(interval);

$(window).resize(function () { updateGraph(true); });

getData(function () {
  createGraph();
  setInterval(function () {
    getData(function () {
      updateGraph();
    });
  }, interval);
});

function getData(callback) {
  $.getJSON(rootDir + "/api/voters/count", function(results){
    var voters = results.count;
    $.getJSON(rootDir + "/api/papers/votes/count", function(results){
      var paperVotes = results.count;
      $.getJSON(rootDir + "/api/demos/votes/count", function(results){
        var demoVotes = results.count;
        data = [
            { "name": "システム登録者数", "count": voters }
          , { "name": "発表賞", "count": paperVotes }
          , { "name": "対話発表賞", "count": demoVotes }
        ];
        callback();
      });
    });
  });
}

var labelWidth = 0, margin = 7;
function createGraph() {
  var width = $(".graph").width()
    , barHeight = 50;

  var chart = d3.select(".graph svg")
    .attr("width", width)
    .attr("height", barHeight * data.length);

  var bar = chart.selectAll("g").data(data);
  var g = bar.enter().append("g");
  g.attr("transform", function(d, i) {
    return "translate(0," + i * barHeight + ")";
  });

  labelWidth = 0;
  g.append("text")
    .attr("class", "label")
    .attr("y", barHeight / 2)
    .attr("dy", ".15em")
    .text(function(d){
      return d.name;
    }).each(function() {
      labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    });

  var x = d3.scale.linear()
    .domain([0, d3.max(data, function (d) { return d.count; })])
    .range([0, width - (labelWidth + margin)]);

  g.append("rect")
    .attr("x", labelWidth + margin)
    .attr("width", function(d) {
      return x(d.count) + "px";
    })
    .attr("height", barHeight - 5);
  g.append("text")
    .attr("class", "data")
    .attr("x", function(d) {
      return x(d.count) - 3 + labelWidth + margin;
    })
    .attr("dx", "-.2em")
    .attr("y", barHeight / 2)
    .attr("dy", ".15em")
    .text(function(d) {
      return d.count;
    });
}

function updateGraph(instant) {
  var width = $(".graph").width()
    , barHeight = 50;

  var x = d3.scale.linear()
    .domain([0, d3.max(data, function (d) { return d.count; })])
    .range([0, width - (labelWidth + margin)]);

  var chart = d3.select(".graph svg")
    .attr("width", width)
    .attr("height", barHeight * data.length);

  var bar = chart.selectAll("g").data(data);
  bar.exit().remove();

  bar.enter()
    .append("g")
    .attr("transform", function(d, i) {
      return "translate(0," + i * barHeight + ")";
    });

  var rect = bar.select("rect");
  if (!instant) {
    rect
      .style("fill", "#0b6")
      .transition()
      .ease("circle")
      .duration(700)
      .style("fill", "#093")
  }
  rect
    .attr("width", function(d) {
      return x(d.count) + "px";
    });

  var text = bar.select("text.data");
  if (!instant) {
    text
      .transition()
      .ease("circle")
      .duration(700)
  }
  text
    .attr("x", function(d) {
      return x(d.count) - 3 + labelWidth + margin;
    })
    .text(function(d) {
      return d.count;
    });
}
