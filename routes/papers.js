var _ = require('lodash');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var Controller = require('./controller');
var publications = [], collection = 'papers';

csv().fromFile('config/papers.csv')
.on('json', (jsonObj)=>{
  var publication = _.clone(jsonObj);
  publication.paperId = parseInt(publication.paperId);
  publications.push(publication);
})
.on('done', (error)=>{

  /* Papers list */
  router.get('/', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect(res.locals.rootDir + '/');
    }

    var db = req.db;
    var votes = db.collection(collection);
    Controller.getPriorVotes(votes, res.locals.user.id, function(votes) {
      res.render('papers-index', { title: '発表賞の投票 | WISS 2017', publications: publications, votes: votes });
    });
  });

  /* Voting complete */
  router.post('/vote', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect(res.locals.rootDir + '/');
    }

    var votedPublications = req.body && req.body.papers
      ? Controller.votesFromPost(req.body.papers, publications) : [];
    var entry = {
        "userId": res.locals.user.id
      , "isCommittee": res.locals.user.isCommittee
      , "votes": _.map(votedPublications, (publication)=>publication.paperId)
      , "date": new Date()
    };

    var db = req.db;
    var votes = db.collection(collection);
    votes.insertOne(entry).then(function (result) {
      res.render('papers-complete', { title: '発表賞の投票完了 | WISS 2017', publications: votedPublications });
    });
  });
});

module.exports = router;
