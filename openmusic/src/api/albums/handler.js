const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(albumsService, storageService, albumsValidator, uploadsValidator) {
    this.albumsService = albumsService;
    this.storageService = storageService;
    this.albumsValidator = albumsValidator;
    this.uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this.albumsValidator.validateAlbumPayload(request.payload);

    const albumId = await this.albumsService.addAlbum(request.payload);

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
    const album = await this.albumsService.getAlbumByIdWithSongs(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this.albumsValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this.albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this.albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { data } = request.payload;
    this.uploadsValidator.validateImageHeaders(data.hapi.headers);

    const { id: albumId } = request.params;
    const album = await this.albumsService.getAlbumById(albumId);
    await this.storageService.writeFile(data, data.hapi, album);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumHandler;
