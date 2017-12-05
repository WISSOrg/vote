var _ = require('lodash');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var papers = [], posters = [];

/* Top page */
router.get('/', function(req, res, next) {

  // load preset values
  var id, familyYomi;
  if (res.locals.user) {
    id = res.locals.user.id;
    familyYomi = res.locals.user.familyYomi;
  }
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
      title: 'Express'
    , failure: failure
    , id: id
    , familyYomi: familyYomi });
});

csv().fromFile('config/papers.csv')
.on('json', (jsonObj)=>{
  var paper = _.clone(jsonObj);
  paper.paperId = parseInt(paper.paperId);
  papers.push(paper);
})
.on('done', (error)=>{

  /* Papers/posters list */
  router.get('/vote', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect('/');
    }

    var db = req.db;
    var votes = db.collection('votes');
    votes
        .find({'userId': res.locals.user.id})
        .sort({'date': -1})
        .limit(1)
        .toArray(function(err, results) {
      if (err || results.length <= 0) results = {};
      else results = results[0];
      res.render('vote', { title: '投票', papers: papers, votes: results });
    });
  });

  /* Voting complete */
  router.post('/complete', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect('/');
    }

    var voted = req.body && req.body.papers ? getValues(req.body.papers, papers) : [];
    var entry = {
        "userId": res.locals.user.id
      , "votes": _.map(voted, (v)=>v.paperId)
      , "date": new Date()
    };

    var db = req.db;
    var votes = db.collection('votes');
    votes.insertOne(entry).then(function (result) {
      res.render('complete', { title: '投票完了', papers: voted });
    });
  });
});

function getValues(params, db) {
  var indices = [];
  _.forEach(params, function (v, i) {
    if (Array.isArray(v) && v[1]) indices.push(i);
  });
  return _.map(indices, (key) => db[key]);
}

module.exports = router;
