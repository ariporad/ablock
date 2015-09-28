/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const rewire = require('rewire');
const co = require('co');

const noop = () => {};
const GeneratorFunction = Object.getPrototypeOf(function*() {}).constructor;

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
      expect(callFormatter(() => {
        throw new Error('Everything\'s Broken!');
      }).then(ctx => ctx.body.ok)).to.eventually.equal(false);
    });

    it('res.error === error.message', () => {
      const errMsg = 'Everything\'s Broken!';
      return expect(callFormatter(() => {
        throw new Error(errMsg);
      }).then(ctx => ctx.body.error)).to.eventually.equal(errMsg);
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
        function* () {},
        function() {},
        () => void 0,
      ].map(test));
    });
  });
  describe('without an error', () => {
    it('ok = false', () => {
      expect(callFormatter(() => {
        throw new Error('Everything\'s Broken!');
      }).then(ctx => ctx.body.ok)).to.eventually.equal(false);
    });

    it('res.error === error.message', () => {
      const errMsg = 'Everything\'s Broken!';
      return expect(callFormatter(() => {
        throw new Error(errMsg);
      }).then(ctx => ctx.body.error)).to.eventually.equal(errMsg);
    });
  });
});
