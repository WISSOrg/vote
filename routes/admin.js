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
  res.redirect('/');
});

router.get('/get/all', function(req, res, next) {
  var db = req.db;
  var votes = db.collection('votes');
  votes.find({}).toArray(function(err, docs) {
    if (err) {
      res.json({"error": "no record found"});
      return;
    }
    res.json({"results": docs});
  });
});

router.get('/get/votes', function(req, res, next) {
  var db = req.db;
  var votes = db.collection('votes');
  getVotes(votes, (results)=>{
    if (!results) {
      return res.json({"error": "no record found"});
    }
    return res.json(results);
  });
});

router.get('/get/:userId', function(req, res, next) {
  var db = req.db;
  var votes = db.collection('votes');
  votes
      .find({'userId': parseInt(req.params.userId)})
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

router.get('/get/all/:userId', function(req, res, next) {
  var db = req.db;
  var votes = db.collection('votes');
  votes
      .find({'userId': parseInt(req.params.userId)})
      .toArray(function(err, docs) {
    if (err) {
      res.json({"error": "no record found"});
      return;
    }
    res.json({"results": docs});
  });
});

function getVotes(votes, callback) {
  votes.aggregate( 
    [
      {"$sort": { "date": -1 }},
      {"$group": { "_id": { userId: "$userId" }, "votes": { "$first": "$votes" } } }
    ]
  , function(err, docs) {
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
