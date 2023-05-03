const fs = require('fs');

class StorageService {
  constructor(directory) {
    this.directory = directory;
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filenames;
    const path = `${this.directory}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (e) => reject(e));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
