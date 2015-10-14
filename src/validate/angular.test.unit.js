/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* global expect:false, assert:false, request:false */
/* eslint-env mocha */

/**
 * Borrowed and modified from: https://github.com/angular/angular.js/blob/master/validate-commit-msg.spec.js
 */
describe('validate/angular', () => {
  const validate = require('./angular');

  function expectValid(message) {
    if (message instanceof Array) return message.forEach(expectValid);
    expect(validate(message).ok).to.equal(true);
  }

  function expectInvalid(message, ...errorPatterns) {
    const { error: dirtyError, ignore, ok } = validate(message);
    const error = dirtyError.toLowerCase();

    expect(error).to.be.ok; /* eslint-disable-line no-unused-expressions */
    expect(ok).to.equal(false);
    expect(ignore).to.equal(false);

    expect(errorPatterns.reduce((correctError, pattern) => {
      return correctError && !!error.match(pattern);
    }, true)).to.equal(true);
  }

  it('should be valid', () => {
    expectValid([
      'fixup! fix($compile): something',
      'fix($compile): something',
      'feat($location): something',
      'docs($filter): something',
      'style($http): something',
      'refactor($httpBackend): something',
      'test($resource): something',
      'chore($controller): something',
      'chore(foo-bar): something',
      'chore(*): something',
      'chore(guide/location): something',
      'revert(foo): something',
    ]);
  });

  it('should validate 100 characters length', () => {
    // Don't include 'long' in the commit message, in case it decides to quote it in the error, which would be a
    // false positive.
    expectInvalid(
      'fix($compile): something super mega extra giga tera not short, maybe even unshort and less and less short,' +
      ' it\'s getting really not short. Who knows how unshort it will get? It\'s way over the limit though.',
      /long/
    );
  });

  it('should validate "<type>(<scope>): <subject>" format', () => {
    expectInvalid('not correct format', /type/, /scope/, /subject/);
  });

  it('should validate type', () => {
    expectInvalid(
      'notallowedfirstpart(something): make something do something else',
      /notallowedfirstpart/, /type/
    );
  });

  it('should allow empty scope', () => {
    expectValid('fix: everything');
  });

  it('should allow dot in scope', () => {
    expectValid('chore(mocks.$httpBackend): something');
  });

  it('should ignore msg prefixed with "WIP: "', () => {
    expectValid([
      'WIP: something neat',
      'WIP: invalid(scope is bad): NOW I\'VE USED CAPS AND THE PAST TENSE (AND NOW A PERIOD).',
      'WIP: HahAHA',
    ]);
  });
});
