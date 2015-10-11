/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const shell = require('shelljs');
const { resolve } = require('path');
const { basePath } = require('./lib/config');
const testCov = require('./test-cov');


const lcov = resolve(basePath, 'coverage', 'lcov.info');
const coveralls = resolve(basePath, 'node_modules', '.bin', 'coveralls');
// Each item is one command.
const coverageUploadCommand = [
  `cd ${basePath}`,
  `cat ${lcov} | ${coveralls}`,
].join(';');

const uploadCoverage = () => {
  // Only upload coverage once
  if ((process.env.TRAVIS_JOB_NUMBER || '0.1').split('.').pop() === '1') return;

  return shell.exec(coverageUploadCommand);
};

const travis = () => {
  // This way we can good/bad based off tests passing, but still upload coverage
  return new Promise((good, bad) => {
    let passed = true;
    const done = () => passed ? good() : bad();

    return testCov()
      .catch(() => { passed = false; }) // Curly braces so we don't return pass bad through the chain.
      .then(uploadCoverage)
      .then(done, done);
  });
};

gulp.task('travis', ['lint'], travis);

module.exports = travis;
module.exports.uploadCoverage = uploadCoverage;
