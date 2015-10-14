/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const rewire = require('rewire');
const co = require('co');

const noop = () => {};
const errorMessage = 'Everything\'s Broken!';
// We basically define this in every test, so DRY it off.
const throwError = (message = errorMessage) => {
  throw new Error(message);
};

describe('formatResponse', () => {
  let formatResponse;

  function wrapFn(fn) {
    return function* wrappedFn(...args) {
      fn.apply(this, args);
    };
  }

  function callFormatter(next = noop, body = {}, status = 404, ctx = {}) {
    next = wrapFn(next)();
    ctx = { body, status, ...ctx };
    return co.call(ctx, formatResponse(), next).then(() => ctx);
  }

  before(() => {
    formatResponse = rewire('./formatResponse');
  });

  describe('with an error', () => {
    it('ok = false', () => {
      expect(callFormatter(throwError).then(ctx => ctx.body.ok)).to.eventually.equal(false);
    });

    it('res.error === error.message', () => {
      return expect(callFormatter(throwError).then(ctx => ctx.body.error)).to.eventually.equal(errorMessage);
    });

    it('should also handle throwing non-errors', () => {
      const test = (errValue) => {
        return expect(callFormatter(() => {
          throw errValue;
        }).then(ctx => ctx.body.error)).to.eventually.equal(errValue);
      };

      return Promise.all([
        'ERROR!',
        'E12345',
        {},
        { message: 'Error!1' },
        ['Error!'],
        'Pizza',
        5,
        -9999,
        Infinity,
        0,
        -0,
        -Infinity,
        function* error() {},
        function error() {},
        () => void 0,
      ].map(test));
    });

    describe('status code', () => {
      it('should set it to 500', () => {
        return expect(callFormatter(throwError).then(ctx => ctx.status)).to.eventually.equal(500);
      });

      it('UNLESS it has already been set to something that is not 2xx or 404', () => {
        function verifyExpectedStatus(start = 404, expected = start) {
          return expect(callFormatter(throwError, {}, start)
                          .then(ctx => ctx.status))
                          .to.eventually.equal(expected);
        }

        const verifyKeep = status => verifyExpectedStatus(status);
        const verifyIgnore = status => verifyExpectedStatus(status, 500);

        const shouldKeep = [501, 101, 596, 401, 403, 418];
        const shouldIgnore = [200, 238, 404];

        return Promise.all([
          ...shouldKeep.map(verifyKeep),
          ...shouldIgnore.map(verifyIgnore),
        ]);
      });
    });
  });
  describe('without an error', () => {
    it('ok = true', () => {
      expect(callFormatter().then(ctx => ctx.body.ok)).to.eventually.equal(true);
    });

    it('res.payload === ctx.body', () => {
      const body = { Ari: 'awesome', foo: 'bar', baz: 'qux' };
      return expect(callFormatter(noop, body).then(ctx => ctx.body.payload)).to.eventually.equal(body);
    });

    it('if body is a properly formatted response, it should do nothing', () => {
      const body = { ok: true, payload: { ari: 'awesome' } };
      return expect(callFormatter(noop, body).then(ctx => ctx.body)).to.eventually.deep.equal(body);
    });
  });
});
