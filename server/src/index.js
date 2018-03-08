/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);

server.on('listening', () => {
  app.io.on('connect', (socket) => { 
    socket.on('log in', (user) => {
      console.log(user.nickname);
      app.service('users').patch(user._id, { online: true })
      socket.on('disconnect', () => {
        console.log('logging out');
        app.service('users').patch(user._id, { online: false })
      })
    });
  });
});
