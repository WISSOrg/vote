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
  .on('done',(error)=>{
    addHandlers();
  });

function addHandlers() {

  /* User logout */
  router.get('/logout', function(req, res, next) {
    req.session = null;
    res.redirect('/');
  });

  /* User login */
  router.post('/login', function(req, res, next) {
    if (!req.body
        || !req.body.id
        || isNaN(parseInt(req.body.id))
        || !req.body.name) {
      return res.redirect('/?failure=1');
    }
    var user = _.find(users, {
        'id': parseInt(req.body.id)
    });
    if (!user) {
      return res.redirect('/?failure=2');
    }
    if (user.familyYomi !== req.body.name) {
      return res.redirect('/?failure=3');
    }
    req.session = {'user': user};
    res.redirect('/vote');
  });

  /* List users */
  router.get('/list', function(req, res, next) {
    if (!req.session
        || !req.session.user
        || req.session.user.isCommittee !== 1) {
      return res.status(403).json({'error': 'you are not a committee member!'});
    }
    res.json(users);
  });
}

module.exports = router;
