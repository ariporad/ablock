/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const { spawn } = require('child_process');
const { resolve } = require('path');
const compile = require('./lib/compile');
const config = require('./lib/config');
const { mocha } = require('./lib/plugins');
const { logErrors, toDest, streamToPromise } = require('./lib/helpers');


const runMocha = () => {
  return new Promise((good, bad) => {
    spawn(config.mocha.pathToMocha, config.mocha.opts, {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
      env: config.mocha.env,
    })
      .on('close', code => code === 0 ? good() : bad())
      .on('error', bad);
  });
};

const test = () => {
  return compile(config.srcJs, config.dest).promise
    .then(runMocha);
};

gulp.task('test', ['lint'], test);

module.exports = test;
