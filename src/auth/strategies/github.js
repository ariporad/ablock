/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const GitHubStrategy = require('passport-github').Strategy;
const User = require('models/User');

// TODO: at some point, maybe move these into makeGithubStrategy
const githubOptions = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `http://${process.env.HOSTNAME}/auth/github/callback`,
  scope: 'write:repo_hook,repo:status',
};

function processAuth(accessToken, refreshToken, { username, displayName: name, _json: profile }, done) {
  User.findOrCreate({ where: { username }, defaults: { username, name, profile } })
    .spread((user, created) => done(user));
}

module.exports = function makeGithubStrategy() {
  return new GitHubStrategy(githubOptions, processAuth);
};

module.exports._processAuth = processAuth; // For testing
