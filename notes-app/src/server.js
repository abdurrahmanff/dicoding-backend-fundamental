require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes/index.js');
const NotesService = require('./services/inMemory/NotesService.js');
const NotesValidator = require('./validator/notes/index.js');

const init = async () => {
  const notesService = new NotesService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
