/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const proxyquire = require('proxyquire').noPreserveCache();


function expectAppOnPort(expectedPort, done) {
  proxyquire('./index', {
    './app': {
      start(port) {
        // all env values are strings
        expect(`${port}`).to.equal(`${expectedPort}`);
        done();
      },
    },
  });
}

describe('index', () => {
  it('should require app, and start it on process.env.PORT', (done) => {
    process.env.PORT = 5999;
    expectAppOnPort(5999, done);
  });

  it('should default to port 3000 if no port is provided', (done) => {
    if (process.env.PORT) delete process.env.PORT;
    expectAppOnPort(3000, done);
  });
});
