/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
const http = require('http');
const koa = require('koa');

module.exports.start = (port) => {
  return new Promise((done) => {
    const app = koa();

    function* something(arg) {
      let value = arg;
      while(true) value = yield value;
    }

    const s = something(5);
    s.next('pizza');
    s.next({ type: 'food' });
    s.next({ isAwesome: true });

    const server = http.createServer(app.callback());
    server.listen(port, () => done({ app, server }));
  });
};
