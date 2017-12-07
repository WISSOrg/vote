
var pathname = location.pathname;
if (pathname.substr(-1) === '/') pathname = pathname.substring(0, pathname.length-1);
var rootDir = pathname.substring(0, pathname.length-'/stats'.length);

var interval = 2000, data = [], viewData;

$('.interval').text(interval);

$(window).resize(updateGraph);

var dx = 0;
getData(function () {
  createGraph();
  setInterval(function () {
    dx++;
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
            { "name": "システム登録者数", "count": voters + dx }
          , { "name": "発表賞", "count": paperVotes }
          , { "name": "対話発表賞", "count": demoVotes }
        ];
        callback();
      });
    });
  });
}

function createGraph() {
  var width = $(".graph").width()
    , barHeight = 50;

  var x = d3.scale.linear()
    .domain([0, d3.max(data, function (d) { return d.count; })])
    .range([0, width]);

  var chart = d3.select(".graph svg")
    .attr("width", width)
    .attr("height", barHeight * data.length);

  var bar = chart.selectAll("g").data(data);
  var g = bar.enter().append("g");
  g.attr("transform", function(d, i) {
    return "translate(0," + i * barHeight + ")";
  });
  g.append("rect")
    .attr("width", function(d) {
      return x(d.count) + "px";
    })
    .attr("height", barHeight - 5);
  g.append("text")
    .attr("x", function(d) {
      return x(d.count) - 3;
    })
    .attr("dx", "-.2em")
    .attr("y", barHeight / 2)
    .attr("dy", ".15em")
    .text(function(d) {
      return d.name + "(" + d.count + ")";
    });
}

function updateGraph() {
  var width = $(".graph").width()
    , barHeight = 50;

  var x = d3.scale.linear()
    .domain([0, d3.max(data, function (d) { return d.count; })])
    .range([0, width]);

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
  
  bar.filter(function() {
    return d3.select(this).select("rect").empty();
  })
    .append("rect")
    .append("text");

  bar.select("rect")
    .transition()
    .attr("width", function(d) {
      return x(d.count) + "px";
    })
    .attr("height", barHeight - 5);

  bar.select("text")
    .transition()
    .attr("x", function(d) {
      return x(d.count) - 3;
    })
    .attr("dx", "-.2em")
    .attr("y", barHeight / 2)
    .attr("dy", ".15em")
    .text(function(d) {
      return d.name + "(" + d.count + ")";
    });
}
