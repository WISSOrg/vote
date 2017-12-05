var _ = require('lodash');

function getPriorVotes(votes, id, callback) {
  votes
    .find({'userId': id})
    .sort({'date': -1})
    .limit(1)
    .toArray(function (err, results) {
      if (err || results.length <= 0) results = {};
      else results = results[0];
      callback(results);
    });
}

function votesFromPost(params, db) {
  var indices = [];
  _.forEach(params, function (v, key) {
    if (Array.isArray(v) && v[1]) indices.push(key);
  });
  return _.map(indices, (key) => db[key]);
}

module.exports = {
  getPriorVotes: getPriorVotes,
  votesFromPost: votesFromPost
};
