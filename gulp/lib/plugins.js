/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */

module.exports = require('load-deps')('gulp-*', {
  renameKey: name => name.replace(/^gulp-/, ''),
});
