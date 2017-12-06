
var pathname = location.pathname;
if (pathname.substr(-1) === '/') pathname = pathname.substring(0, pathname.length-1);
var rootDir = pathname.substring(0, pathname.length-'/admin'.length);

var db = {};
initialize('paper');
initialize('demo');

function initialize(voteType) {
  $.getJSON(rootDir + "/" + voteType + "s/api/all", function(data){
    db[voteType] = data;
    updateVotes(voteType);
  });
}

function updateVotes(voteType) {
  $.getJSON(pathname + "/api/" + voteType + "s/votes", function(votes){
    var $div = $('.' + voteType + 's .results');
    $div.empty();
    $div.append('<table class="table table-striped"><thead><tr><th class="w-75">発表</th><th class="w-25">得票数</th></tr></thead><tbody></tbody></table>');
    var $tbody = $div.find('tbody');
    for (var key in votes.counts) {

      var condition = {};
      condition[voteType+'Id'] = key;
      var entry = findEntry(db[voteType], condition);

      var $title = $('<strong></strong>')
        .append('<span class="badge badge-pill badge-secondary">' + key + '</span>&nbsp;')
        .append(entry.title);

        var $tr = $('<tr><td class="w-75 pub"></td><td class="w-25">' + votes.counts[key] + '</td></tr>');
      $tr.find('td.pub')
        .append($title)
        .append('<br>')
        .append('<small>' + entry.authors + '</small>');
      $tbody.append($tr);
    }
  });
}

function findEntry(arr, condition) {
  for (var i = 0; i < arr.length; i ++) {
    var ok = true;
    for (var key in condition) {
      if (arr[i][key] != condition[key]) {
        ok = false; 
        break;
      }
    }
    if (ok) return arr[i];
  }
  return null;
}
