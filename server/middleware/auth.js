const models = require('../models');
const cookieParser = require('./cookieParser');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  console.log('requestWithCookies in createSession:', req.cookies.shortlyid);
  
  if (Object.keys(req.cookies).length === 0) {  // If there is no cookie

    // If cookies exist, then use that cookie to find userId
    // model.Users.get({hash:req.cookies}).then ((result) =>{});       

    // If no cookie and no session
    if(req.session === undefined) {
      console.log('req.session doesnt exists ');
      models.Sessions.create().then( (result) => {
        models.Sessions.get({id:result.insertId}).then((result) => {
          req.session = {};
          req.session.hash = result.hash;
          res.cookies = {};
          res.cookies['shortlyid'] = {};
          res.cookies['shortlyid'].value = req.session.hash;
          next();
        }); 
      });

    } else { // If no cookie and session exists

      models.Sessions.get({id:result.insertId}).then((result) => {
        req.session = {};
        req.session.hash = result.hash;
        res.cookies = {};
        res.cookies['shortlyid'] = {};
        res.cookies['shortlyid'].value = req.session.hash;
        next();

      }); 
    }

  } else { // If cookies exist
    console.log('Cookies exist');

    if (req.session === undefined) { // and no session

      console.log('session doesnt exist');

        models.Sessions.create().then( (result) => {
        req.session = {};
        req.session.hash = req.cookies.shortlyid;

        models.Sessions.get({hash:req.cookies.shortlyid}).then ((result) =>{ 
        // Use cookie to find userId
        // Then use userId to find username

          //console.log('result:',result);
          req.session.hash = req.cookies.shortlyid;
          req.session.user = {};
          req.session.userId = result.userId; 

              console.log('req.session:',req.session);

              if (result.userId !== null) {

                models.Users.get({id: result.userId}).then ( (result) => {
                  req.session.user.username = result.username;
                  console.log('req.session.user:',req.session.user);
                  console.log('res.sessions after:',req.session);

                  next();
                });
              } else {

                next();
              }

            });      
        });
      } else {  // and session exists

        console.log('session does exist');

            models.Sessions.get({hash:req.cookies.shortlyid}).then ((result) =>{ 
              // Use cookie to find userId
                // Then use userId to find username

              req.session.hash = req.cookies.shortlyid;
              req.session.user = {};
              req.session.user.userId = result.userId; 

              models.Users.get({id: result.userId}).then ( (result) => {
                req.session.user.username = result.username;
                console.log('req.session.user:',req.session.user);
                 next();
              });

            });

            

          
      }

  }




    // Get userId from session
      
    // Use the userId from session to find username in Users db
    // Once we have username and userId, set them as properties to session
    //models.Users.get({})
 
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

