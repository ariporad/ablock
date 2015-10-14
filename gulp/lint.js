/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const gulp = require('gulp');
const config = require('./lib/config');
const { eslint } = require('./lib/plugins');

const lint = () => {
  return gulp.src(config.srcJs.concat(config.lint.other))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

gulp.task('lint', lint);

module.exports = lint;
