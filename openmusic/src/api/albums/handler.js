const autobind = require('autobind');

class AlbumHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autobind(this);
  }

  async postAlbum(request, h) {
    this.validator.validateAlbumPayload(request.payload);

    const albumId = this.service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = this.service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumById(request) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    this.service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumById(request) {
    const { id } = request.params;

    this.service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumHandler;
