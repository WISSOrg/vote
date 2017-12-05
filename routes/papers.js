var _ = require('lodash');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var papers = [];

csv().fromFile('config/papers.csv')
.on('json', (jsonObj)=>{
  var paper = _.clone(jsonObj);
  paper.paperId = parseInt(paper.paperId);
  papers.push(paper);
})
.on('done', (error)=>{

  /* Papers list */
  router.get('/', function(req, res, next) {
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
      res.render('papers-index', { title: '登壇投票 | WISS 2017', papers: papers, votes: results });
    });
  });

  /* Voting complete */
  router.post('/vote', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect('/');
    }

    var voted = req.body && req.body.papers ? getValues(req.body.papers, papers) : [];
    var entry = {
        "userId": res.locals.user.id
      , "isCommittee": res.locals.user.isCommittee
      , "votes": _.map(voted, (v)=>v.paperId)
      , "date": new Date()
    };

    var db = req.db;
    var votes = db.collection('votes');
    votes.insertOne(entry).then(function (result) {
      res.render('papers-vote', { title: '登壇投票完了 | WISS 2017', papers: voted });
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
