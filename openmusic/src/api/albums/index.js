const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (
    server,
    {
      albumsService, storageService, albumsValidator, uploadsValidator,
    },
  ) => {
    const albumHander = new AlbumHandler(
      albumsService,
      storageService,
      albumsValidator,
      uploadsValidator,
    );
    server.route(routes(albumHander));
  },
};
