/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */
const rewire = require('rewire');

describe('index', () => {
  let index;
  beforeEach(() => {
    index = rewire('./index');
  });

  it('should do something', () => {
    expect(index).to.not.throw();
  });
});
