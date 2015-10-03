/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
require('./setup');

const app = require('./app');
app.start(process.env.PORT || 3000);
