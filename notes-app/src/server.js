require('dotenv').config();

const Hapi = require('@hapi/hapi');

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

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
