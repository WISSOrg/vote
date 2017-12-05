var express = require('express');
var router = express.Router();

/* Top page */
router.get('/', function(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/vote');
  }
  var failure = 0;
  if (req.query
      && req.query.failure
      && !isNaN(parseInt(req.query.failure))) {
    failure = parseInt(req.query.failure);
  }
  res.render('index', {
      title: 'Express'
    , failure: failure });
});

/* Papers/posters list */
router.get('/vote', function(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  // load papers/posters csv
  res.render('vote', { title: '投票', papers: [], posters: [] });
});

/* Voting complete */
router.post('/complete', function(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  res.render('complete', { title: '投票完了' });
});

module.exports = router;
