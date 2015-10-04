/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const JwtStrategy = require('passport-jwt').Strategy;
const fs = Promise.promisifyAll(require('fs'));
const User = require('models/User');

// TODO: at some point, maybe move these into makeJwtStrategy
const jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  // TODO: I don't understand issuer and audience, and I think I'm using them wrong.
  issuer: process.env.HOSTNAME,
  audience: process.env.HOSTNAME,
  algorithms: ['HS256', 'HS384'], // TODO: I don't understand these either. This is just the default. Pick good ones.
  authScheme: 'Bearer',
};

function processAuth(payload, done) {
  User.findOne({ where: { username: payload.username } })
    .then(user => done(null, user || false))
    .catch(err => done(err, false));
}

module.exports = function makeJwtStrategy() {
  return new JwtStrategy(jwtOptions, processAuth);
};

module.exports._processAuth = processAuth; // For testing
