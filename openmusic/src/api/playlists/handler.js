const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this.service.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.service.getPlaylists({ owner: credentialId });

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistOwner(id, { owner: credentialId });
    await this.service.removePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongByIdHandler(request, h) {
    this.validator.validatePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this.service.verifyPlaylistAccess(id, credentialId);
    await this.service.addSongToPlaylist(id, { songId });
    await this.service.logActivity(id, songId, 'add', credentialId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this.service.getPlaylistById(id, { owner: credentialId });

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    this.validator.validatePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this.service.verifyPlaylistAccess(id, credentialId);
    await this.service.removeSongFromPlaylistById(id, { songId });
    await this.service.logActivity(id, songId, 'delete', credentialId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    const logActivities = await this.service.getLogActivities(id);

    return {
      status: 'success',
      data: logActivities,
    };
  }
}

module.exports = PlaylistHandler;
