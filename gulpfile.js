/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
/* eslint no-var:0, prefer-const: 0, vars-on-top: 0 */
require('babel/register')({
  only: /\/gulp\//,
});

require('require-dir')('./gulp');
