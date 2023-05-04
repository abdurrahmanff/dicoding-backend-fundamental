const path = require('path');

const routes = () => [
  {
    method: 'GET',
    path: '/images/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'api/public/images'),
      },
    },
  },
];

module.exports = routes;
