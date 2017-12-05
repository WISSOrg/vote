var _ = require('lodash');
var express = require('express');
var router = express.Router();

/* Top page */
router.get('/', function(req, res, next) {
  if (res.locals.user) {
    return res.redirect('/vote');
  }
  res.render('index', { title: 'Express' });
});

// router.get('/put', function(req, res, next) {
//   if (!req.query
//       || !req.query.id
//       || !req.query.name
//       || !req.query.vote) {
//     res.json({"error": "insufficient query parameter"});
//     return;
//   }
//   if (isNaN(parseInt(req.query.id))
//       || isNaN(parseInt(req.query.vote))) {
//     res.json({"error": "incorrect query parameter"});
//     return;
//   }
//   var entry = {
//       "id": parseInt(req.query.id)
//     , "name": req.query.name
//     , "vote": parseInt(req.query.vote)
//   };
//   var db = req.db;
//   var votes = db.collection('votes');
//   votes.insertOne(entry).then(function (result) {
//     res.json({"result": result, "entry": entry});
//   });
// });

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
  votes.aggregate( 
    [
      {"$sort": { "date": -1 }},
      {"$group": { "_id": { userId: "$userId" }, "votes": { "$first": "$votes" } } }
    ]
  , function(err, docs) {
    if (err) {
      res.json({"error": "no record found"});
      return;
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
    res.json(results);
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

module.exports = router;
