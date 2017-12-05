var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/put', function(req, res, next) {
  if (!req.query
      || !req.query.id
      || !req.query.name
      || !req.query.vote) {
    res.json({"error": "insufficient query parameter"});
    return;
  }
  if (isNaN(parseInt(req.query.id))
      || isNaN(parseInt(req.query.vote))) {
    res.json({"error": "incorrect query parameter"});
    return;
  }
  var entry = {
      "id": parseInt(req.query.id)
    , "name": req.query.name
    , "vote": parseInt(req.query.vote)
  };
  var db = req.db;
  var votes = db.collection('votes');
  votes.insertOne(entry).then(function (result) {
    res.json({"result": result, "entry": entry});
  });
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

module.exports = router;
