const models = require('../models');
const cookieParser = require('./cookieParser');
const utils = require('./../lib/hashUtils');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {  // Only passed in parsed requests

  var incomingCookies = req.cookies;
  console.log('\n\n');
  console.log('incomingCookies:',incomingCookies);


  if (incomingCookies.shortlyid) {

    console.log('There are cookies');
    models.Sessions.get({hash:incomingCookies.shortlyid}).then( (session, err) =>{

      console.log('found session:',session);

      if (!session) throw session;

      req.session = session;
      next();

    }).catch ( () => {

    console.log('There is no session assigned to cookies');
    models.Sessions.create().then( (results) =>{

      //console.log('new session:', results);

      models.Sessions.get({ id: results.insertId }).then ( (session) => {

        res.cookie('shortlyid', session.hash);
        req.session = session;
        next();
      });

    });

    });

  } else {

    models.Sessions.create().then( (results) =>{
      //console.log('new session:', results);

      models.Sessions.get({ id: results.insertId }).then ( (session) => {

        res.cookie('shortlyid', session.hash);
        req.session = session;
        next();
      });

    });

  }
  
  
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {

    console.log('req.session in verifySession:',req.session);


  if (!models.Sessions.isLoggedIn(req.session)) { // No 
    console.log('User is not logged in');
    console.log('\n\n');
    res.redirect('/login');
  } else {
    console.log('User is logged in');
    next();
  }
};

