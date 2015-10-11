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

config.clean = {
  other: [basePath('coverage')],
};

config.tests = join(config.src, '**', '*.test.js');
config.mocha = {
  // Because of child_process.spawn nonsense, we have to specify the option name and value as seperate strings.
  opts: [
    '--require', join(config.dest, 'setup.js'),
    '--require', basePath('test', 'setup.js'),
    config.tests.replace(config.src, config.dest),
  ],

  pathToMocha: resolve(__dirname, '..', '..', 'node_modules', '.bin', 'mocha'),

  env: Object.assign({}, process.env, {
    NODE_ENV: 'test',
  }),
};

config.babel = {
  opts: {
    babelrc: basePath('.babelrc'),
  }
};

module.exports = config;
