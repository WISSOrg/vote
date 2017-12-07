var express = require('express');
var router = express.Router();
var userCollection = 'users';

/* Top page */
router.get('/', function(req, res, next) {

  // do not show this page for authenticated users
  if (res.locals.user) {
    return res.redirect(res.locals.rootDir + '/users/login');
  }

  // load preset values
  var id, familyYomi;
  if (req.query) {
    if (req.query.id) id = req.query.id;
    if (req.query.familyYomi) familyYomi = req.query.familyYomi;
  }

  // get error code
  var failure = 0;
  if (req.query
      && req.query.failure
      && !isNaN(parseInt(req.query.failure))) {
    failure = parseInt(req.query.failure);
  }

  res.render('index', {
      title: res.locals.confName + ' 投票システム'
    , failure: failure
    , id: id
    , familyYomi: familyYomi });
});

/* About this system */
router.get('/about', function(req, res, next) {
  res.render('about', {
      title: res.locals.confName + ' 投票システムについて' });
});

/* Statistics */
router.get('/stats', function(req, res, next) {
  res.locals.url = req.protocol + '://' + res.locals.host /* req.get('host') */ + res.locals.rootDir;
  res.render('stats', {
      title: res.locals.confName + ' 投票状況' });
});

/* Count up vote ids */
router.get('/api/voters/count', function(req, res, next) {
  var db = req.db;
  var users_ = db.collection(userCollection);
  users_.find({}).count(function (err, count) {
    res.json({"count": err ? 0 : count});
  });
});

/* Count up votes */
router.get('/api/:voteType/votes/count', function(req, res, next) {
  var db = req.db;
  var votes = db.collection(req.params['voteType']);
  countVotes(votes, (results) => res.json(results), false);
});

/* Count up votes by committee members */
router.get('/api/:voteType/votes/committee/count', function(req, res, next) {
  var db = req.db;
  var votes = db.collection(req.params['voteType']);
  countVotes(votes, (results) => res.json(results), true);
});

function countVotes(votes, callback, committeeFilter) {
  var query = committeeFilter ? {"isCommittee" : true} : undefined;
  votes.distinct("userId", query, function(err, docs) {
    if (err || !Array.isArray(docs)) {
      return callback({"count": 0});
    }
    callback({"count": docs.length});
  });
}

module.exports = router;
