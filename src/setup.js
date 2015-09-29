/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
if (!global._hasDoneSetup) {
  global._hasDoneSetup = true;
  const Bluebird = require('bluebird');

// Just for performance
  if (global.Promise !== Bluebird) global.Promise = Bluebird;

// This will throw an error if loaded twice.
// This will also use Bluebird promises.
  if (!global._babelPolyfill) require('babel/polyfill');

// This has a build in multiple call check
  require('app-module-path').addPath(__dirname);
}
