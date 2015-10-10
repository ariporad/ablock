/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const compile = require('./lib/compile');
const config = require('./lib/config');
const { mocha } = require('./lib/plugins');
const { logErrors, toDest, streamToPromise } = require('./lib/helpers');


const afterBuild = () => {
  const testStream = gulp.src(toDest(config.tests), { read: false })
    .pipe(mocha(config.mocha.opts));
  logErrors(testStream);
  return testStream;
};

const test = () => {
  return compile(config.srcJs, config.dest).promise
    .then(afterBuild);
};

gulp.task('test', ['lint'], () => {
  // The returned promise would only execute after our then, so we don't have to worry about it.
  return test().then((stream) => {
    stream.on('error', () => process.exit(1));
    stream.on('end', () => process.exit(0));
  });
});

module.exports = test;
