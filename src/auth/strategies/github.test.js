/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const proxyquire = require('proxyquire');

describe('auth/strategies/github', () => {
  describe('_processAuth', () => {
    let processAuth;
    let user;
    let created;
    let options;

    before(() => {
      processAuth = proxyquire('./github', {
        'models/User': {
          findOrCreate(opts) {
            options = opts;
            return new Promise((good, bad) => {
              process.nextTick(() => good([user, created]));
            });
          },
          '@noCallThru': true,
        },
      })._processAuth;
    });

    it('should findOrCreate the user, WHERE username, with defaults of { username, name, profile }', (done) => {
      const username = 'ariporad';
      const name = 'Ari Porad';
      const profile = { email: 'example@example.com' };

      created = true;
      user = { username, name, profile };

      processAuth('something', 'secret', { username, displayName: name, _json: profile }, (usr) => {
        expect(options.where.username).to.equal(username);
        expect(options.defaults.username).to.equal(username);
        expect(options.defaults.name).to.equal(name);
        expect(options.defaults.profile).to.deep.equal(profile);
        expect(usr).to.equal(user);
        done();
      });
    });
  });

  describe('strategy', () => {
    it('should be a passport-github strategy', () => {
      // Proxyquire it here to ignore the require cache
      expect(proxyquire('./github', {})()).to.be.an.instanceof(require('passport-github').Strategy);
    });
  });
});
