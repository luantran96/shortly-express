const models = require('../models');
const cookieParser = require('./cookieParser');
const utils = require('./../lib/hashUtils');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {  // Only passed in parsed requests

  var incomingCookies = req.cookies;
  console.log('\n\n');
  console.log('incomingCookies:',incomingCookies);

  // if (!incomingCookies.shortlyid) {  // If there is no cookie

  //   console.log('Cookies dont exist');
  //   if(req.session === undefined) {    // If no cookie and no session
  //     console.log('req.session doesnt exists ');
  //     models.Sessions.create().then( (result) => {
  //       models.Sessions.get({id:result.insertId}).then((newSession) => {

  //         req.session = {};
  //         req.session.hash = newSession.hash;
  //         console.log('new session hash:',req.session.hash);
  //         req.session.user = {};
  //         res.cookie('shortlyid',req.session.hash);
  //         next();
  //       }); 
  //     });

  //   } else { // If no cookie and session exists
  //     console.log('req.session exists ');
  //     models.Sessions.get({id:result.insertId}).then((result) => {
  //       //req.session = {};
  //       req.session.hash = result.hash;
  //       res.cookie('shortlyid',req.session.hash);

  //       next();

  //     }); 
  //   }

  // } else { // If cookies exist
  //   console.log('Cookies exist');
  //   req.session = {};
  //   req.session.hash = incomingCookies.shortlyid;

  //     models.Sessions.get({hash:incomingCookies.shortlyid}).then ((result) =>{ 

  //       if (result && result.userId !== null) { // If cookie is assigned to session
  //       console.log('Cookie is assigned to a session');
  //       req.session.hash = incomingCookies. shortlyid.value;
  //       req.session.user = {};
  //       req.session.userId = result.userId; 

  //         models.Users.get({id: result.userId}).then ( (result) => {
  //           req.session.user.username = result.username;    
  //           next();
  //         });
  //       } else { // If cookie is not assigned to session
  //         console.log('Cookie is not assigned to a session');

  //         models.Sessions.create().then( (result) => {
  //           models.Sessions.get({id:result.insertId}).then((result) => {
  //             //req.session = {};
  //             req.session.hash = result.hash;
  //             res.cookie('shortlyid',req.session.hash);

  //             next();
  //           }); 
  //         });

  //        // next();
  //       }

  //     });

  //   }

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

