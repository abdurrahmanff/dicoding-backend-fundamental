const fs = require('fs');

class StorageService {
  constructor(directory, albumsService) {
    this.directory = directory;
    this.albumsService = albumsService;
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  writeFile(file, meta, album) {
    if (album.cover) {
      fs.unlinkSync(`${this.directory}/${album.cover}`);
    }
    const filename = +new Date() + meta.filename;
    const path = `${this.directory}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((_, reject) => {
      fileStream.on('error', (e) => reject(e));
      file.pipe(fileStream);
      file.on('end', () => this.albumsService.upsertCoverAlbumById(album.id, filename));
    });
  }
}

module.exports = StorageService;
