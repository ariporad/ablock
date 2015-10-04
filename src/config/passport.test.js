/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const rewire = require('rewire');

describe('passport', () => {
  let passport;
  beforeEach(() => {
    passport = rewire('./passport');
  });

  it('should do something', () => {
    //expect(passport).to.not.throw();
  });
});
