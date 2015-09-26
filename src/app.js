/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
const http = require('http');
const koa = require('koa');

module.exports.start = (port) => {
  return new Promise((done) => {
    const app = koa();

    const server = http.createServer(app.callback());
    server.listen(port, () => done({ app, server }));
  });
};
