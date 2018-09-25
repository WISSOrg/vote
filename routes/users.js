var _ = require('lodash');
var fs = require('fs');
// var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var users = []
  , signupCollection = 'signups'
  , userCollection = 'users';

fs.readFile('config/users.json', { encoding: 'utf8' }, (err, data) => {
  // "id" : 9999,
  // "email" : "jun.kato@aist.go.jp",
  // "name1" : "加藤",
  // "name2" : "淳",
  // "isCommittee": "1"
  users = JSON.parse(data);
  addHandlers();
});

function addHandlers() {

  /* User logout */
  router.post('/logout', function(req, res, next) {
    req.session = null;
    return res.redirect(res.locals.rootDir + '/users/login');
  });

  /* User logout confirmation */
  router.get('/logout', function(req, res, next) {
    if (!res.locals.user) {
      return res.redirect(res.locals.rootDir + '/users/login');
    }
    return res.redirect(res.locals.rootDir + '/users/login?id=' + res.locals.user.id + '&logout=1');
  });

  /* User login */
  router.get('/login', function(req, res, next) {
    if (req.query.failure) {
      return res.render('login', {
          title: res.locals.confName + ' 投票システム'
        , failure: parseInt(req.query.failure)
        , id: req.query.id });
    }
    res.locals.url = res.locals.protocol + '://' + res.locals.host + res.locals.rootDir;

    if (!req.query.id) {
      if (res.locals.user) {
        return res.redirect(res.locals.rootDir + '/users/login?id=' + res.locals.user.id);
      }
      return res.render('login', {
          title: res.locals.confName + ' 投票システム' });
    }
    var userId = req.query.id;

    var param = '&id=' + encodeURIComponent(userId);
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
        , user: user
        , logout: req.query.logout });
    });
  });

  /* User signup */
  router.post('/signup', function(req, res, next) {
    if (!req.body) {
      return res.redirect(res.locals.rootDir + '/?failure=1');
    }

    var param = '&id=' + req.body.id
      + '&email=' + req.body.email;
    if (!req.body.id
        || isNaN(parseInt(req.body.id))
        || !req.body.email) {
      return res.redirect(res.locals.rootDir + '/?failure=1' + param);
    }

    var user = _.find(users, {
      'id': parseInt(req.body.id)
    });
    if (!user) {
      return res.redirect(res.locals.rootDir + '/?failure=2' + param);
    }
    if (user.email !== req.body.email) {
      return res.redirect(res.locals.rootDir + '/?failure=3' + param);
    }

    var db = req.db;
    var signups = db.collection(signupCollection)
      , users_ = db.collection(userCollection);
    signups.find({id: user.id}).toArray(function(err, docs) {
      if (!err && Array.isArray(docs) && docs.length > 0) {

        // Allow creating infinite new users by admins
        if (_.includes(res.locals.admins, user.id)) {
          return createNewUser(false, true);
        }
        return res.redirect(res.locals.rootDir + '/?failure=4' + param);
      }

      // Limit creating only one user by the others
      createNewUser(user.isCommittee, false);
    });

    function createNewUser(isCommittee, isAdmin) {

      // TODO: duplicate check
      var voteId = guid();

      var newSignup = signups.insertOne({id: user.id, isAdmin: isAdmin})
        , newUser = users_.insertOne({id: voteId, isCommittee: isCommittee, isAdmin: isAdmin});
      Promise.all([newSignup, newUser]).then(function(){
        res.redirect(res.locals.rootDir + '/users/login?id=' + voteId);
        moveRandomEntry(users_);
      });
    }
  });

  /* Count users */
  router.get('/api/count', function(req, res, next) {
    res.json({'counts': users.length});
  });

  /* List users */
  router.get('/api/all', function(req, res, next) {
    if (!res.locals.user
        || !res.locals.user.isCommittee) {
      return res.status(403).json({'error': 'you are not a committee member!'});
    }
    res.json(users);
  });

  /* List vote ids */
  router.get('/api/voters', function(req, res, next) {
    if (!res.locals.user
        || !res.locals.user.isCommittee) {
      return res.status(403).json({'error': 'you are not a committee member!'});
    }
    var db = req.db;
    var users_ = db.collection(userCollection);
    users_.find({}).toArray(function(err, docs) {
      if (err) {
        res.json({"error": "no record found"});
        return;
      }
      res.json({"results": docs});
    });
  });

  /* Return a random user */
  router.get('/api/voters/random', function(req, res, next) {
    if (!res.locals.user
        || !res.locals.user.isCommittee) {
      return res.status(403).json({'error': 'you are not a committee member!'});
    }
    var db = req.db;
    var users_ = db.collection(userCollection);
    users_.aggregate(
      [
        {$sample:{size: 1}}
      ]
    , function(err, docs){
      if (err) {
        res.json({"error": "no record found"});
        return;
      }
      res.json({"results": docs});
    });
  });
}

// See https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript for details
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + s4() + '-' + s4() + s4();
}

function moveRandomEntry(collection, callback) {
  collection.aggregate(
    [
      {$sample:{size: 1}}
    ]
  , function(err, docs){
    if (err || !Array.isArray(docs) || docs.length <= 0) {
      if (callback) callback(null);
      return;
    }
    var entry = docs[0];
    collection.deleteOne(entry).then(function (){
      delete entry['_id'];
      collection.insertOne(entry).then(()=>{
        if (callback) callback(entry);
        return;
      });
    });
  });
}

module.exports = router;
