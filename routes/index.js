var express = require('express');
var router = express.Router();

/* Top page */
router.get('/', function(req, res, next) {

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

module.exports = router;
