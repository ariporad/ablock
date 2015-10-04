/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* istanbul ignore next: this doesn't need to be tested */
if (!global._hasDoneSetup) {
  global._hasDoneSetup = true;

  require('dotenv').load();

// This will throw an error if loaded twice.
  try {
    require('babel/polyfill');
  } catch (err) {
    // Babel throws an error if loaded more than once. We don't care.
  }

// Override Babel's promises.
  if (!global.Bluebird) global.Bluebird = require('bluebird');
  global.Promise = global.Bluebird;

// This has a build in multiple call check
  require('app-module-path').addPath(__dirname);
}
