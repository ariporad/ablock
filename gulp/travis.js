/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const shell = require('shelljs');
const { basePath } = require('./lib/config');
const testCov = require('./test-cov');

const travis = () => {
  let didError = false;

  const done = () => {
    // Make sure didError is a boolean, then cast to a number (exit 0 if no error, 1 if error)
    process.exit(+!!didError);
  };

  // Set didError to true on error
  const onError = (err) => {
    didError = true;
    if (err.message) console.error(err.message);
    if (err.stack) console.error(err.stack);
  };

  const uploadCoverage = (coverageStream) => {
    // Only upload coverage once
    if ((process.env.TRAVIS_JOB_NUMBER || '0.1').split('.').pop() === '1') return;
    shell.exec([
      // Each item is one command.
      'cd ' + basePath,
      'cat ' + basePath + '/coverage/lcov.info | ' + basePath + '/node_modules/coveralls/bin/coveralls.js',
    ].join(';'));
  };

  return testCov()
    .catch(onError)
    .then(uploadCoverage)
    .then(done, done);
};

gulp.task('travis', ['lint'], travis);

module.exports = travis; // TODO: Make travis more re-use friendly.
