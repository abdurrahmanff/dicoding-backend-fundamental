const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this.collaborationsService = collaborationsService;
    this.playlistsService = playlistsService;
    this.usersService = usersService;
    this.validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.usersService.verifyUser(userId);
    await this.playlistsService.verifyPlaylistOwner(playlistId, { owner: credentialId });
    const collaborationId = await this.collaborationsService.addCollaboration({
      playlistId, userId,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan kolaborasi',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this.validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistsService.verifyPlaylistOwner(playlistId, { owner: credentialId });
    await this.collaborationsService.removeCollaboration({ playlistId, userId });

    return {
      status: 'success',
      message: 'Berhasil menghapus kolaborasi',
    };
  }
}

module.exports = CollaborationsHandler;
