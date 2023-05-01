const ExportsHandler = require('./handler.js');
const routes = require('./routes.js');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const exportsHandler = new ExportsHandler(service, validator);
    server.route(routes(exportsHandler));
  },
};
