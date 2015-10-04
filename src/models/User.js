/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const { STRING, JSON } = require('sequelize');
const sequelize = require('config/database');

const User = sequelize.define('user', {
  username: {
    type: STRING,
    unique: true,
    primaryKey: true,
  },
  name: STRING,
  profile: JSON,
}, {
  indexes: [
    {
      unique: true,
      fields: ['username'],
    },
  ],
});

module.exports = User;
