/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const rewire = require('rewire');
const openport = require('openport');
const http = require('http');
const koa = require('koa');

function getOpenPort() {
  return new Promise((good, bad) => {
    openport.find((err, port) => {
      if (err) bad(err);
      else good(port);
    });
  });
}

describe('app', () => {
  let application;
  before(() => {
    application = rewire('./app');
  });

  describe('start', () => {
    it('should start a server on the passed in port, and return a promise', () => {
      return getOpenPort()
        .then((port) => {
          const result = application.start(port);
          expect(result).to.be.an.instanceof(Promise);
          return result.then(({ server }) => server.close());
        });
    });
    it('should eventually be an object, containing both a http server and a Koa instance', () => {
      return getOpenPort()
        .then(port => application.start(port))
        .then(({ server, app }) => {
          expect(server).to.be.an.instanceof(http.Server);
          expect(app).to.be.an.instanceof(koa);
          server.close();
        });
    });
    it('should start the server on `port`', () => {
      return getOpenPort()
        .then((port) => {
          return application.start(port)
            .then(({ server }) => {
              expect(server.address().port).to.equal(port);
              return server.close();
            });
        });
    });
  });

  describe('app', () => {
    let app;
    let server;
    before((done) => {
      // You can't destructure to existing variables. It's annoying.
      application.start().then((data) => {
        app = data.app;
        server = data.server;
        done();
      });

      //throw new Error('testing');
    });
    describe('/', () => {
      it('200 OK, JSON', () => {
        return request(server)
          .get('/')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(({ body }) => {
            if (body.ok !== true) throw new Error('Expected res.body.ok to be true');
          })
          .end();
      });
    });
  });
});
