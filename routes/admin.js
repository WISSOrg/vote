var _ = require('lodash');
var express = require('express');
var router = express.Router();

router.use((req, res, next)=>{
  if (!res.locals.user
      || !res.locals.user.isCommittee) {
    return res.status(403).json({'error': 'you are not a committee member!'});
  }
  next();
});

/* Top page */
router.get('/', function(req, res, next) {
  res.render('admin', { title: '集計結果 | ' + res.locals.confName });
});

router.get('/api/:voteType/all', function(req, res, next) {
  var db = req.db;
  var votes = db.collection(req.params['voteType']);
  votes.find({}).toArray(function(err, docs) {
    if (err) {
      res.json({"error": "no record found"});
      return;
    }
    res.json({"results": docs});
  });
});

router.get('/api/:voteType/votes', function(req, res, next) {
  var db = req.db;
  var votes = db.collection(req.params['voteType']);
  getVotes(votes, (results)=>{
    if (!results) {
      return res.json({"error": "no record found"});
    }
    return res.json(results);
  });
});

router.get('/api/:voteType/votes/committee', function(req, res, next) {
  var db = req.db;
  var votes = db.collection(req.params['voteType']);
  getVotes(votes, (results)=>{
    if (!results) {
      return res.json({"error": "no record found"});
    }
    return res.json(results);
  }, true);
});

router.get('/api/:voteType/:userId', function(req, res, next) {
  var db = req.db;
  var votes = db.collection(req.params['voteType']);
  votes
      .find({'userId': req.params.userId})
      .sort({'date': -1})
      .limit(1)
      .toArray(function(err, docs) {
    if (err) {
      res.json({"error": "no record found"});
      return;
    }
    res.json({"results": docs});
  });
});

router.get('/api/all/:voteType/:userId', function(req, res, next) {
  var db = req.db;
  var votes = db.collection(req.params['voteType']);
  votes
      .find({'userId': req.params.userId})
      .toArray(function(err, docs) {
    if (err) {
      res.json({"error": "no record found"});
      return;
    }
    res.json({"results": docs});
  });
});

function getVotes(votes, callback, committeeFilter) {
  var pipeline = [
    {"$sort": { "date": -1 }},
    {"$group": { "_id": { userId: "$userId" }, "votes": { "$first": "$votes" } } }
  ];
  if (committeeFilter) {
    pipeline.unshift({"$match": { "isCommittee": true }});
  }
  votes.aggregate(pipeline, function(err, docs) {
    if (err) {
      return callback(null);
    }
    var counts = _.reduce(docs, (cs, entry)=>{
      if (Array.isArray(entry.votes)) {
        _.each(entry.votes, (v)=>{
          if (typeof cs[v] === 'undefined') cs[v] = 1;
          else cs[v] ++;
        });
      }
      return cs;
    }, {});
    var results = {'counts': counts}
    callback(results);
  });
}

module.exports = router;
