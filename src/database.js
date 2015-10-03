/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL);

module.exports = sequelize;
