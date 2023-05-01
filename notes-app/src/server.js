require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// notes
const notes = require('./api/notes/index.js');
const NotesService = require('./services/postgres/NotesService.js');
const NotesValidator = require('./validator/notes/index.js');

// users
const users = require('./api/users/index.js');
const UsersService = require('./services/postgres/UsersServices.js');
const UsersValidator = require('./validator/users/index.js');

// authentications
const authentications = require('./api/authentications/index.js');
const AuthenticationsService = require('./services/postgres/AuthenticationsService.js');
const TokenManager = require('./tokenize/TokenManager.js');
const AuthenticationsValidator = require('./validator/authentications/index.js');

// collaborations
const collaborations = require('./api/collaborations/index.js');
const CollaborationsService = require('./services/postgres/CollaborationsService.js');
const CollaborationsValidator = require('./validator/collaborations/index.js');

// Exports
const _exports = require('./api/exports/index.js');
const ProducerService = require('./services/rabbitmq/ProducerService.js');
const ExportsValidator = require('./validator/exports/index.js');

// uploads
const uploads = require('./api/uploads/index.js');
const StorageService = require('./services/storage/StorageService.js');
const UploadsValidator = require('./validator/uploads/index.js');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const notesService = new NotesService(collaborationsService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

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
    {
      plugin: Inert,
    },
  ]);

  // Define JWT Strat
  server.auth.strategy('notesapp_jwt', 'jwt', {
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

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
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
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
