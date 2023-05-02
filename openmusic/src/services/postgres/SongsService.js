const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { MapSongDbToModel } = require('../../utils');

class SongsSerivce {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    if (title && !performer) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1',
        values: [`%${title}%`],
      };
      const result = await this.pool.query(query);
      return result.rows.map(MapSongDbToModel);
    }
    if (!title && performer) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(performer) LIKE $1',
        values: [`%${performer}%`],
      };
      const result = await this.pool.query(query);
      return result.rows.map(MapSongDbToModel);
    }
    if (title && performer) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };
      const result = await this.pool.query(query);
      return result.rows.map(MapSongDbToModel);
    }

    const result = await this.pool.query('SELECT id, title, performer FROM songs');
    return result.rows.map(MapSongDbToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, performer, genre, duration, album_id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(MapSongDbToModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $2, year = $3, genre = $4, performer = $5, duration = $6, album_id = $7, updated_at = $8 WHERE id = $1 RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, Id tidak ditemukan');
    }
  }

  async removeSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu, Id tidak ditemukan');
    }
  }
}

module.exports = SongsSerivce;
