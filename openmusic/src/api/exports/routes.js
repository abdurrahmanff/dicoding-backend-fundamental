const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportPlaylistByIdHandler,
    options: {
      auth: 'notesapp_jwt',
    },
  },
];

module.exports = routes;
