/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
module.exports = function(passport) {
  passport.use(require('auth/strategies/github')());
  passport.use(require('auth/strategies/jwt')());

  return passport;
};
