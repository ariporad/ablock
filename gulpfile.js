/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* eslint no-var:0, prefer-const: 0, vars-on-top: 0 */
var gulp = require('gulp');
var del = require('del');
var once = require('once');
var shell = require('shelljs');
var plugins = require('load-deps')('gulp-*', {
  renameKey: function removeGulp(name) {
    return name.replace(/^gulp-/, '');
  },
});

function logErrors(stream) {
  stream.on('error', function logError(err) {
    if (err.message) console.error(err.message);
    if (err.stack) console.error(err.stack);
  });
}

function negate(paths) {
  return paths.map(function mapNegate(path) {
    return '!' + path;
  });
}

var SRC = 'src';
var DEST = 'build';
var SPIKES = './spikes';

var SRC_OTHER = [SRC + '/**', '!**/*.js'];
var SRC_JS = [SRC + '/**/*.js'];

var LINT_OTHER = [__filename, SPIKES + '/**.js'];

var TESTS = [SRC + '/**/*.test.js'];
var MOCHA_OPTS = {
  require: [
    __dirname + '/test/setup.js',
    __dirname + '/' + DEST + '/setup.js',
  ],
  reporter: 'spec',
};

var BABEL_OPTIONS = {
  babelrc: __dirname + '/.babelrc',
};

function toDest(paths) {
  return paths.map(function mapToDest(path) {
    return path.replace(SRC, DEST);
  });
}

function compile(src, dest, cb) {
  var stream = gulp.src(src)
    .pipe(plugins.changed(dest))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel(BABEL_OPTIONS))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(dest));
  if (cb && typeof cb === 'function') stream.on('finish', cb);
  return stream;
}

gulp.task('default', ['build']);
gulp.task('build', ['build:js', 'copy:other']);
gulp.task('build:js', function buildJS() {
  return compile(SRC_JS.concat(negate(TESTS)), DEST);
});

gulp.task('copy:other', function copy() {
  return gulp.src(SRC_OTHER)
    .pipe(gulp.dest(DEST));
});

gulp.task('lint', function lint() {
  return gulp.src(SRC_JS.concat(LINT_OTHER))
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

function test(done) {
  compile(SRC_JS, DEST, function runTests() {
    var testStream = gulp.src(toDest(TESTS), { read: false })
      .pipe(plugins.mocha(MOCHA_OPTS));
    logErrors(testStream);
    done(testStream);
  });
}

gulp.task('test', ['lint'], function testTask(done) {
  test(function runTests(stream) {
    stream.on('error', process.exit.bind(process, 1));
    stream.on('end', process.exit.bind(process, 0));
  });
});

function testCoverage(done) {
  compile(SRC_JS, DEST, function instrumentCode() {
    gulp.src(toDest(SRC_JS.concat(negate(TESTS))))
      .pipe(plugins.istanbul()) // Covering files
      .pipe(plugins.istanbul.hookRequire()) // Force `require` to return covered files
      .on('finish', function runTests() {
        var coverageStream = gulp.src(toDest(TESTS))
          .pipe(plugins.mocha(MOCHA_OPTS))
          .pipe(plugins.istanbul.writeReports()) // Creating the reports after tests ran
          .pipe(plugins.istanbul.enforceThresholds({ thresholds: { global: 90 } })); // Min CC
        logErrors(coverageStream);
        done(coverageStream);
      });
  });
}

gulp.task('test:cov', ['lint', 'build'], function testCov(done) {
  testCoverage(function setupExit(stream) {
    stream
      .on('error', function dieScreaming(err) {
        setTimeout(process.exit.bind(process, 1), 50); // Let the event loop clear
      })
      .on('end', function dieNicely() {
        setTimeout(process.exit.bind(process, 0), 50); // Let the event loop clear
      });
  });
});

gulp.task('travis', ['lint'], function travis(cb) {
  var didError = false;

  function done() {
    // Make sure didError is a boolean, then cast to a number (exit 0 if no error, 1 if error)
    process.exit(+!!didError);
  }

  // Set didError to true on error
  function handleDidError(stream) {
    stream.on('error', function onError() {
      didError = true;
    });
  }

  var uploadCoverage = once(function uploadToCoveralls(coverageStream) {
    // Only upload coverage once
    if ((process.env.TRAVIS_JOB_NUMBER || '0.1').split('.').pop() === '1') return done();
    shell.exec([
      // Each item is one command.
      'cd ' + __dirname,
      'cat ' + __dirname + '/coverage/lcov.info | ' + __dirname + '/node_modules/coveralls/bin/coveralls.js',
    ].join(';'));
    done();
  });

  testCoverage(function coverage(coverageStream) {
    handleDidError(coverageStream);
    coverageStream.on('end', once(function afterCoverage(err) {
      uploadCoverage(coverageStream);
    }));
  });
});

gulp.task('watch', ['build'], function watch() {
  MOCHA_OPTS.reporter = 'min';
  return gulp.watch(SRC_JS, function onWatch() {
    test(function afterTests(stream) {
    });
  });
});

gulp.task('clean', function clean() {
  return del([DEST]);
});
