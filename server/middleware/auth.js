const models = require('../models');
const cookieParser = require('./cookieParser');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  cookieParser(req, res, () => {
    console.log('req.cookies:', req.cookies);
    models.Sessions.create().then( (result) => {
      if (Object.keys(req.cookies).length === 0) {  // If there is no cookie
        req.session = {};

        models.Sessions.get({id:result.insertId}).then((result) => {
          req.session.hash = result.hash;
          res.cookies = {};
          res.cookies['shortlyid'] = {};
          res.cookies['shortlyid'].value = req.session.hash;
          next();
        }); 
      } else {  // If there are cookies
        console.log('IN HERE');
          
        models.Sessions.create().then( (result) => {

          req.session = {};
        
          models.Sessions.get({id:result.insertId}).then((result) => {
                    
          });
        });
      }

    });
    // Get userId from session
      
    // Use the userId from session to find username in Users db
    // Once we have username and userId, set them as properties to session
    //models.Users.get({})
  });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

