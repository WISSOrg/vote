
var pathname = location.pathname;
if (pathname.substr(-1) === '/') pathname = pathname.substring(0, pathname.length-1);
var rootDir = pathname.substring(0, pathname.length-'/admin'.length);

var db = {};
initialize('paper');
initialize('demo', function() {
  updateVotes('demo', true);
});

function initialize(voteType, callback) {
  $.getJSON(rootDir + "/" + voteType + "s/api/all", function(data){
    db[voteType] = data;
    updateVotes(voteType, false, callback);
  });
}

$('a.update').click(function (e) {
  e.preventDefault();
  updateVotes('paper');
  updateVotes('demo');
  updateVotes('demo', true);
  return false;
});

function updateVotes(voteType, committeeFilter, callback) {
  var $div = $('.' + (committeeFilter ? 'committee-' : '') + voteType + 's .results');
  var $alert = $div.find('.alert');
  $alert.nextAll().remove();
  $alert.show();
  setTimeout(function () {
    $.getJSON(pathname + "/api/" + voteType + "s/votes"
        + (committeeFilter ? '/committee' : ''), function(votes){
      $alert.hide();
      $div.append('<table class="table table-striped"><thead><tr><th class="w-75">発表</th><th class="w-25">得票数</th></tr></thead><tbody></tbody></table>');
      var arr = [];
      for (var key in votes.counts) {
        var condition = {};
        condition[voteType+'Id'] = key;
        var entry = findEntry(db[voteType], condition);
        entry['key'] = key;
        arr.push(entry);
      }
      arr.sort(function (a, b) {
        return b.key > a.key ? -1 : 1;
      });
      arr.sort(function (a, b) {
        return votes.counts[b.key] - votes.counts[a.key];
      });
      var $tbody = $div.find('tbody');
      for (var i = 0; i < arr.length; i ++) {
        var entry = arr[i];

        var $title = $('<strong></strong>')
          .append('<span class="badge badge-pill badge-secondary">' + entry.key + '</span>&nbsp;')
          .append(entry.title);

        var $tr = $('<tr><td class="w-75 pub"></td><td class="w-25">' + votes.counts[entry.key] + '</td></tr>');
        $tr.find('td.pub')
          .append($title)
          .append('<br>')
          .append('<small>' + entry.authors + '</small>');
        $tbody.append($tr);
      }
      if (callback) callback();
    });
  }, 300);
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
