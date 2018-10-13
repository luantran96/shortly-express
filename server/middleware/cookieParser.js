const parseCookies = (req, res, next) => {
  
  var cookieObj = {};
  
  if (req.headers.cookie) {

    var cookies = req.headers.cookie.split('; ');
    cookies.forEach( (cookie) => {
      var temp = cookie.split('=');
      cookieObj[temp[0]] = temp[1];   
    });
    //console.log(cookieObj);
    req.cookies = cookieObj;
  } else {
    req.cookies = {};
  }

  // Access the cookies on a req
  // Parse them into an object
  // Assign this obj to a cookies property
  next();

};

module.exports = parseCookies;