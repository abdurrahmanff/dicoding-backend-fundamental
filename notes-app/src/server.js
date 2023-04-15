const Hapi = require('@hapi/hapi');
const routes = require('./api/notes/routes.js');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  server.route(routes);
  await server.start();
};

init();
