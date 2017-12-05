var _ = require('lodash');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var Controller = require('./controller');
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
    Controller.getPriorVotes(votes, res.locals.user.id, function(votes) {
      res.render('papers-index', { title: '登壇投票 | WISS 2017', papers: papers, votes: votes });
    });
  });

  /* Voting complete */
  router.post('/vote', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect('/');
    }

    var votedPapers = req.body && req.body.papers
      ? Controller.votesFromPost(req.body.papers, papers) : [];
    var entry = {
        "userId": res.locals.user.id
      , "isCommittee": res.locals.user.isCommittee
      , "votes": _.map(votedPapers, (paper)=>paper.paperId)
      , "date": new Date()
    };

    var db = req.db;
    var votes = db.collection('votes');
    votes.insertOne(entry).then(function (result) {
      res.render('papers-vote', { title: '登壇投票完了 | WISS 2017', papers: votedPapers });
    });
  });
});

module.exports = router;
