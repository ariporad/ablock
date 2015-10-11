/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const _ = require('lodash');
const { spawn } = require('child_process');
const { resolve } = require('path');
const config = require('./lib/config');
const test = require('./test');

const node_modules = resolve(config.basePath, 'node_modules', '.bin');
const istanbul = resolve(node_modules, 'istanbul');
const _mocha = resolve(node_modules, '_mocha');

const changeMochaOptions = () => {
  let originalMochaConfig = _.cloneDeep(config.mocha);
  config.mocha.pathToMocha = istanbul;
  config.mocha.opts.unshift('cover', _mocha, '--');

  return () => config.mocha = originalMochaConfig;
};

const checkCoverage = () => {
  return new Promise((good, bad) => {
    const istanbulArgs = _.flatten(Object.keys(config.codeCoverage.thresholds).map((key) => {
      return [`--${key}`, config.codeCoverage.thresholds[key]]
    }));

    spawn(istanbul, ['check-coverage', ...istanbulArgs], { cwd: config.basePath, stdio: 'inherit' })
      .on('close', code => code === 0 ? good() : bad('Code Coverage Failed'))
      .on('error', bad);
  });
};

// TODO: clean up, remove unneeded deps
const testCov = (cb) => {
  const revertMochaOptions = changeMochaOptions();
  return test()
    .finally(revertMochaOptions)
    .then(checkCoverage);
};

gulp.task('test:cov', ['lint'], testCov);

module.exports = testCov;
