var _ = require('lodash');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var Controller = require('./controller');
var publications = [], collection = 'demos';

csv().fromFile('config/demos.csv')
.on('json', (jsonObj)=>{
  publications.push(jsonObj);
})
.on('done', (error)=>{

  /* Demos list */
  router.get('/', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect(res.locals.rootDir + '/');
    }

    var db = req.db;
    var votes = db.collection(collection);
    Controller.getPriorVotes(votes, res.locals.user.id, function(votes) {
      res.render('demos-index', { title: '対話発表賞の投票 | WISS 2017', publications: publications, votes: votes });
    });
  });

  /* Voting complete */
  router.post('/vote', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect(res.locals.rootDir + '/');
    }

    var votedPublications = req.body && req.body.demos
      ? Controller.votesFromPost(req.body.demos, publications) : [];
    var entry = {
        "userId": res.locals.user.id
      , "isCommittee": res.locals.user.isCommittee
      , "votes": _.map(votedPublications, (publication)=>publication.demoId)
      , "date": new Date()
    };

    var db = req.db;
    var votes = db.collection(collection);
    votes.insertOne(entry).then(function (result) {
      res.render('demos-complete', { title: '対話発表賞の投票完了 | WISS 2017', publications: votedPublications });
    });
  });
});

module.exports = router;
