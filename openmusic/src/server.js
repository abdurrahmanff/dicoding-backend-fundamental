require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Album plugin
const AlbumsService = require('./services/AlbumsService');
const albums = require('./api/albums');
const AlbumValidator = require('./validator/album');

// Song plugin
const songs = require('./api/songs');
const SongsSerivce = require('./services/SongsService');
const SongValidator = require('./validator/song');

// User plugin
const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validator/users');

// Authentications plugin
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// Playlists pugin
const playlists = require('./api/playlists');
const PlaylistService = require('./services/PlaylistsService');
const PlaylistValidator = require('./validator/playlist');

// Collaborations plugin
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/PlaylistsService');
const CollaborationsValidator = require('./validator/collaboration');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register external plugins
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Define JWT Strat
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  const albumsService = new AlbumsService();
  const songsService = new SongsSerivce();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistService = new PlaylistService(songsService);

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
