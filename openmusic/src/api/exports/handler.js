class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this.ProducerService = ProducerService;
    this.playlistsService = playlistsService;
    this.validator = validator;
  }

  async postExportPlaylistByIdHandler(request, h) {
    this.validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.playlistsService.verivyPlaylistOwner(playlistId, { owner: credentialId });

    const message = {
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
    };

    await this.ProducerService.sendMessage('export:playlists', message);

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
