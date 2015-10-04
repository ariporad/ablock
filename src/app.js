/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
const http = require('http');
const koa = require('koa');
const koaRouter = require('koa-router');
const formatResponse = require('./middleware/formatResponse');
const passport = require('koa-passport');
const session = require('koa-session');
const User = require('models/User'); // FIXME: don't have this here for promise stuff.

require('config/passport');

module.exports.start = (port) => {
  const app = koa();
  const router = koaRouter();

  router.get('/', function* getRoot(next) {
    this.body = { ok: true };
  });

  router.get('/auth/github',
             passport.authenticate('github')
  );

  router.get('/auth/github/callback',
             passport.authenticate('github', {
               successRedirect: '/app',
               failureRedirect: '/',
             })
  );

  app.keys = ['secret'];

  app
    .use(require('koa-bodyparser')())
    .use(session(app))
    .use(passport.initialize())
    .use(passport.session())
    .use(formatResponse())
    .use(router.routes())
    .use(router.allowedMethods());

  const server = http.createServer(app.callback());

  const startServer = () => {
    return new Promise((done) => {
      server.listen(port, () => done({ app, server }));
    });
  };

  return Promise.all([
    User.sync(),
  ]).then(startServer);
};
