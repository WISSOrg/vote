var _ = require('lodash');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var users = []
  , signupCollection = 'signups'
  , userCollection = 'users';

csv().fromFile('config/users.csv')
  .on('json', (jsonObj)=>{
    // "id": "100",
    // "familyName": "Hoge",
    // "givenName": "Fuga",
    // "familyYomi": "ほげ",
    // "givenYomi": "ふが",
    // "mail": "mail@example.com",
    // "isCommittee": "1"
    var user = _.clone(jsonObj);
    user.id = parseInt(user.id);
    user.isCommittee = parseInt(user.isCommittee) === 1;
    users.push(user);
  })
  .on('done', (error)=>{
    addHandlers();
  });

function addHandlers() {

  /* User logout */
  router.get('/logout', function(req, res, next) {
    req.session = null;
    return res.redirect(res.locals.rootDir + '/users/login');
  });

  /* User login */
  router.get('/login', function(req, res, next) {
    if (req.query.failure) {
      return res.render('login', {
          title: res.locals.confName + ' 投票システム'
        , failure: parseInt(req.query.failure)
        , id: parseInt(req.query.id) });
    }

    if (!req.query.id) {
      if (res.locals.user) {
        return res.redirect(res.locals.rootDir + '/users/login?id=' + res.locals.user.id);
      }
      return res.render('login', {
          title: res.locals.confName + ' 投票システム' });
    }
    var userId = parseInt(req.query.id);

    var param = '&id=' + userId;
    var db = req.db;
    var users = db.collection(userCollection);
    users.find({id: userId}).toArray(function(err, docs) {
      if (err || !Array.isArray(docs) || docs.length < 1) {
        req.session = null;
        return res.redirect(res.locals.rootDir + '/users/login?failure=1' + param);
      }
      var user = docs[0];
      req.session = {'user': user};
      return res.render('login', {
          title: res.locals.confName + ' 投票システム'
        , user: user });
    });
  });

  /* User signup */
  router.post('/signup', function(req, res, next) {
    if (!req.body) {
      return res.redirect(res.locals.rootDir + '/?failure=1');
    }
    var param = '&id=' + req.body.id
      + '&familyYomi=' + req.body.familyYomi;
    if (!req.body.id
        || isNaN(parseInt(req.body.id))
        || !req.body.familyYomi) {
      return res.redirect(res.locals.rootDir + '/?failure=1' + param);
    }
    var user = _.find(users, {
      'id': parseInt(req.body.id)
    });
    if (!user) {
      return res.redirect(res.locals.rootDir + '/?failure=2' + param);
    }
    if (user.familyYomi !== req.body.familyYomi) {
      return res.redirect(res.locals.rootDir + '/?failure=3' + param);
    }

    var db = req.db;
    var signups = db.collection(signupCollection)
      , users_ = db.collection(userCollection);
    signups.find({id: user.id}).toArray(function(err, docs) {
      if (!err && Array.isArray(docs) && docs.length > 0) {
        return res.redirect(res.locals.rootDir + '/?failure=4' + param);
      }

      // TODO: duplicate check
      var voteId = Math.floor(Math.random() * 100000000) + 1;

      var newSignup = signups.insertOne({id: user.id})
        , newUser = users_.insertOne({id: voteId, isCommittee: user.isCommittee});
      Promise.all([newSignup, newUser]).then(function(){
        res.redirect(res.locals.rootDir + 'users/login?id=' + voteId);
      });
    });
  });

  /* List users */
  router.get('/all', function(req, res, next) {
    if (!res.locals.user
        || !res.locals.user.isCommittee) {
      return res.status(403).json({'error': 'you are not a committee member!'});
    }
    res.json(users);
  });
}

module.exports = router;
