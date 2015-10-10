/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const { resolve, join } = require('path');

const config = {};

config.basePath = resolve(__dirname, '..', '..');
const basePath = (...paths) => resolve(config.basePath, ...paths);

config.src = basePath('src');
config.dest = basePath('build');
config.spikes = basePath('spikes');

config.srcJs = [join(config.src, '**', '*.js')];
config.srcOther = [join(config.src, '**'), '!**/*.js'];

config.lint = {
  other: [resolve(__dirname, '..'), join(config.spikes, '**', '*.js')],
};

config.tests = [join(config.src, '**', '*.test.js')];
config.mocha = {
  opts: {
    require: [
      join(config.dest, 'setup.js'),
      basePath('test', 'setup.js'),
    ],
    reporter: 'spec',
  }
};

config.babel = {
  opts: {
    babelrc: basePath('.babelrc'),
  }
};

module.exports = config;
