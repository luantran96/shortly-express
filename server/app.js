const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const CookieParser = require('./middleware/CookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(CookieParser);
app.use(Auth.createSession);

app.get('/',Auth.verifySession,  
  (req, res) => {
    res.render('index');
  });



app.get('/create', 
  (req, res) => {
    res.render('index');
  });

app.get('/links', 
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links', 
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup', (req, res) => {

  const {username, password} = req.body;

  console.log('\n\n');
  console.log('username:',username);
  console.log('\n\n');
  console.log('session hash for username:',req.session);

  models.Users.get({username}).then( (result) => {

    if (!result) {
      models.Users.create(req.body).then ((result) => {


        models.Sessions.update({id: result.insertId}, {userId: result.insertId}).then( () =>{

          res.redirect('/');
        });
    
      });
    } else {
      res.redirect('/signup');
    }
  });

});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/login', (req, res) => {

  const {username, password} = req.body;
  models.Users.get({username}).then ( (user) => {

    if (user) {

      var hashedPassword = user.password;
      var salt = user.salt;

      if (models.Users.compare(password, hashedPassword, salt)) {
        console.log('Log in successful !!');
        res.redirect('/');     
      } else {
        res.redirect('/login');
      }

    } else {

      res.redirect('/login');
    }


  });

});

app.get('/login', (req, res) => {
  res.render('login');
});


app.get('/logout', (req,res) => {

  // Delete current session
  // create a new session with no userId

  console.log('HELLO FROM LOGOUT!');
  console.log('req from /logout:',req);
  console.log('req.cookies from /logout:',req.cookies);
  

  const {cookies} = req;

  //console.log('cookies.shortlyid:',cookies.shortlyid);
  models.Sessions.delete({hash: cookies.shortlyid}).then (() => {

      res.clearCookie('shortlyid');
      console.log('Redirecting to login page...');
      res.redirect('/login');
  }); 

});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
