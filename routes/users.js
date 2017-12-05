var _ = require('lodash');
var csv = require('csvtojson');
var express = require('express');
var router = express.Router();
var users = [];

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
    return res.redirect(res.locals.rootDir + '/');
  });

  /* User login */
  router.post('/login', function(req, res, next) {
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
    req.session = {'user': user};
    res.redirect(res.locals.rootDir + '/papers');
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
