function onlyUsers(req, res, next) {
  if(!req.session.userId) {
    
    return res.redirect('/users/login');
  }

  req.user = req.session.userId;

  next();
}

function isLoggedRedirectToUsers(req, res, next) {
  if(req.session.userId) {
    
    return res.redirect('/users');
  }

  next();
}

module.exports = { onlyUsers, isLoggedRedirectToUsers };