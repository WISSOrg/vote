
var pathname = location.pathname;
if (pathname.substr(-1) === '/') pathname = pathname.substring(0, pathname.length-1);

updateVotes('paper');
updateVotes('demo');

function updateVotes(voteType) {
  $.getJSON(pathname + "/api/" + voteType + "s/votes", function(data){
    var $div = $('.' + voteType + 's .results');
    $div.empty();
    $div.append('<table class="table table-striped"><thead><tr><th class="w-25">ID</th><th class="w-75">得票数</th></tr></thead><tbody></tbody></table>');
    var $tbody = $div.find('tbody');
    for (var key in data.counts) {
      $tbody.append('<tr><td class="w-25">' + key + '</td><td class="w-75">' + data.counts[key] + '</td></tr>');
    }
  });
}
