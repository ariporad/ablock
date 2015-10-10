/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const compile = require('./lib/compile');
const config = require('./lib/config');
const { mocha, istanbul } = require('./lib/plugins');
const { logErrors, toDest, negate, streamToPromise } = require('./lib/helpers');

const instrumentCode = () => {
  return gulp.src(toDest(config.srcJs.concat(negate(config.tests))))
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
};

const runCoveredTests = () => {
  const coverageStream = gulp.src(toDest(config.tests))
    .pipe(mocha(config.mocha.opts))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 }})); // TODO: move to config
  logErrors(coverageStream);
  return coverageStream;
};

const testCov = () => {
  return compile(config.srcJs, config.dest).promise
    .then(instrumentCode)
    .then(s => new Promise(s.once.bind(s, 'end')))
    .then(() => console.log('TODO: test:cov exiting silently. Debug?'))
    .then(runCoveredTests)
    .then(streamToPromise);
};

gulp.task('test:cov', ['lint'], () => {
  return testCov()
    .then(() => console.log('TODO: test:cov exiting silently. Debug?'))
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
});

module.exports = testCov;
