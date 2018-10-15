const models = require('../models');
const cookieParser = require('./cookieParser');
const utils = require('./../lib/hashUtils');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {  // Only passed in parsed requests

  var incomingCookies = req.cookies;
  console.log('incomingCookies:',incomingCookies);

  if (Object.keys(incomingCookies).length === 0) {  // If there is no cookie

    console.log('Cookies dont exist');
    if(req.session === undefined) {    // If no cookie and no session
      console.log('req.session doesnt exists ');
      models.Sessions.create().then( (result) => {
        models.Sessions.get({id:result.insertId}).then((result) => {
          req.session = {};
          req.session.hash = result.hash;
          console.log('new session hash:',req.session.hash);
          req.session.user = {};
          
          console.log('req.body in createSession:',req.body);

          res.cookie('shortlyid',req.session.hash);
          next();

        
        }); 
      });

    } else { // If no cookie and session exists
      console.log('req.session exists ');
      models.Sessions.get({id:result.insertId}).then((result) => {
        //req.session = {};
        req.session.hash = result.hash;
        res.cookie('shortlyid',req.session.hash);

        next();

      }); 
    }

  } else { // If cookies exist
    console.log('Cookies exist');
    req.session = {};
    req.session.hash = incomingCookies.shortlyid;

      models.Sessions.get({hash:incomingCookies.shortlyid}).then ((result) =>{ 

        if (result && result.userId !== null) { // If cookie is assigned to session
        console.log('Cookie is assigned to a session');
        req.session.hash = incomingCookies. shortlyid.value;
        req.session.user = {};
        req.session.userId = result.userId; 

          models.Users.get({id: result.userId}).then ( (result) => {
            req.session.user.username = result.username;    
            next();
          });
        } else { // If cookie is not assigned to session
          console.log('Cookie is not assigned to a session');
          models.Sessions.create().then( (result) => {
            models.Sessions.get({id:result.insertId}).then((result) => {
              req.session = {};
              req.session.hash = result.hash;
              res.cookie('shortlyid',req.session.hash);

              next();
            }); 
          });

         // next();
        }

      });

    }

  

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {
  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  } else {
    next();
  }
};

