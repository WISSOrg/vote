
var pathname = location.pathname;
if (pathname.substr(-1) === '/') pathname = pathname.substring(0, pathname.length-1);
var rootDir = pathname.substring(0, pathname.length-'/stats'.length);

var interval = 2000;

$('.interval').text(interval);

setInterval(function () {
  getData(function (data) {
    updateGraph(data);
  });
}, interval);

function getData(callback) {
  $.getJSON(rootDir + "/api/voters/count", function(data){
    var voters = data.count;
    $.getJSON(rootDir + "/api/papers/votes/count", function(data){
      var paperVotes = data.count;
      $.getJSON(rootDir + "/api/demos/votes/count", function(data){
        var demoVotes = data.count;
        var data = [
            { "name": "システム登録者数", "count": voters }
          , { "name": "発表賞", "count": paperVotes }
          , { "name": "対話発表賞", "count": demoVotes }
        ];
        callback(data);
      });
    });
  });
}

function updateGraph(data) {
  var x = d3.scale.linear()
    .domain([0, d3.max(data, function (d) { return d.count; })])
    .range([0, $(".graph").width()]);

  d3.select(".graph")
    .selectAll("div")
      .data(data)
    .enter().append("div")
      .style("width", function(d) { return x(d.count) + "px"; })
      .text(function(d) { return d.name + "(" + d.count + ")"; });
}
