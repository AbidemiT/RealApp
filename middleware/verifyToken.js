let jwt = require('jsonwebtoken');
let secret = 'musicApp';
let verifyToken = function (req,res,next) {
  let token = req.headers['authorization']

  if (!token) {
    return next();
  } else {
    jwt.verify(token, secret, (err, decode) => {
      if (err) {
        return next();
      } else {
        req.user = decode;
        req.token = token;
        next()
      }
    })
  }
}

module.exports = verifyToken;