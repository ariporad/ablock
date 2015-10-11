/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const _ = require('lodash');
const { resolve } = require('path');
const config = require('./lib/config');
const test = require('./test');

const node_modules = resolve(__dirname, '..', 'node_modules', '.bin');
const istanbul = resolve(node_modules, 'istanbul');
const _mocha = resolve(node_modules, '_mocha');

const changeMochaOptions = () => {
  let originalMochaConfig = _.cloneDeep(config.mocha);
  config.mocha.pathToMocha = istanbul;
  config.mocha.opts.unshift('cover', _mocha, '--');

  return () => config.mocha = originalMochaConfig;
};

// TODO: fail if CC is too low (istanbul check-coverage), clean up, remove unneeded deps
const testCov = () => {
  const revertMochaOptions = changeMochaOptions();
  const passThroughRevertMochaOptions = (result) => {
    revertMochaOptions();
    return result;
  };
  return test()
    .then(passThroughRevertMochaOptions); // TODO: revert on error.
};

gulp.task('test:cov', ['lint'], testCov);

module.exports = testCov;
