let verifyToken = (req, res, next) => {
  let token = localStorage.getItem('token');
  let bearerHeader = "Bearer " + token;
  
  if (bearerHeader !== "undefined") {
    // Split BearerHeader
    let splitBheader = bearerHeader.split(' ');
    let bearerToken = splitBheader[1];
    req.token = bearerToken;
    next();
  } else {
    res.statusCode(403);
  }
}

module.exports = verifyToken;