/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  // Don't log every SQL query
  logging: false, // TODO: make configurable (verbose mode?)
});

module.exports = sequelize;
