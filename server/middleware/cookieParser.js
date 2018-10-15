const parseCookies = (req, res, next) => {
  
  var cookieObj = {};

   var cookieStr = req.get('Cookie') || '';


    var cookies = cookieStr.split('; ').forEach( (cookie) => {
      if (cookie.length) {
        var temp = cookie.split('=');
        var key = temp[0];
        var value = temp[1];
        cookieObj[temp[0]] = temp[1];   
      }
    });

  req.cookies = cookieObj;
  
  next();
};

module.exports = parseCookies;