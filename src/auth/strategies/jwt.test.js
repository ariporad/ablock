/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const proxyquire = require('proxyquire');

const noop = () => {};
// `defer`s are generally bad, but we need to trigger a promise outside of it's constructor
function defer() {
  const out = {};
  out.promise = new Promise((good, bad) => {
    out.good = good;
    out.bad = bad;
  });
  return out;
}

describe('auth/strategies/jwt', () => {
  describe('_processAuth', () => {
    let processAuth;
    let options;
    let defered;

    before(() => {
      processAuth = proxyquire('./jwt', {
        'models/User': {
          findOne(opts) {
            options = opts;
            defered = defer();
            return defered.promise;
          },
          '@noCallThru': true,
        },
      })._processAuth;
    });

    it('should findOne, WHERE payload.username', () => {
      const payload = { username: 'ariporad' };

      processAuth(payload, noop);
      expect(options.where.username).to.equal(payload.username);
      defered.good(); // Clean up
    });

    it('success', (done) => {
      const payload = { username: 'ariporad' };
      const user = { name: 'Ari Porad', username: 'ariporad', profile: {} };

      processAuth(payload, (err, usr) => {
        expect(err).to.equal(null);
        expect(usr).to.equal.deep.equal(user);
        done();
      });

      defered.good(user);
    });

    it('no user found', (done) => {
      const payload = { username: 'ariporad' };

      processAuth(payload, (err, user) => {
        expect(err).to.equal(null);
        expect(user).to.equal(false);
        done();
      });

      defered.good(null);
    });

    it('error', (done) => {
      const payload = { username: 'ariporad' };
      const error = new Error('Everything\'s Broken!');

      processAuth(payload, (err, user) => {
        expect(err).to.equal(error);
        expect(user).to.equal(false);
        done();
      });

      defered.bad(error);
    });
  });

  describe('strategy', () => {
    it('should be a passport-jwt strategy', () => {
      // Proxyquire it here to ignore the require cache
      expect(proxyquire('./jwt', {})()).to.be.an.instanceof(require('passport-jwt').Strategy);
    });
  });
});
