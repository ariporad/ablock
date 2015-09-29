/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
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

  function callFormatter(next = noop, ctx = { body: {}, status: 404 }) {
    next = wrapFn(next)();
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
          return expect(callFormatter(throwError, { body: {}, status: start }).then(ctx => ctx.status)).to.eventually.equal(expected);
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
    it('ok = false', () => {
      expect(callFormatter(throwError).then(ctx => ctx.body.ok)).to.eventually.equal(false);
    });

    it('res.error === error.message', () => {
      return expect(callFormatter(throwError).then(ctx => ctx.body.error)).to.eventually.equal(errorMessage);
    });
  });
});
