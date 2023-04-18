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

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersService();

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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
