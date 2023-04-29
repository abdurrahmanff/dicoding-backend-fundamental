const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const AuthorizationError = require('../exceptions/AuthorizationError');
const { MapPlaylistDbToModel } = require('../utils');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistsService {
  constructor(songService) {
    this.pool = new Pool();
    this.songService = songService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal membuat playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylists({ owner }) {
    const query = {
      text: `SELECT playlists.*, users.username 
      FROM playlists 
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1
      GROUP BY playlists.id`,
      values: [owner],
    };
    const result = await this.pool.query(query);

    return result.rows.map(MapPlaylistDbToModel);
  }

  async removePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist, Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, { songId }) {
    await this.verifyPlaylist(playlistId);
    await this.songService.getSongById(songId);

    const id = `playlist_songs-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu ke playlist');
    }
  }

  async getPlaylistById(id, { owner }) {
    await this.verifyPlaylist(id);

    const query = {
      text: `SELECT 
      playlists.id, playlists.name, playlists.owner, playlist_songs.* 
      FROM playlists AS p
      LEFT JOIN playlist_songs AS ps ON p.id = ps.playlist_id
      WHERE p.owner = $1 AND ps.id = $2`,
      values: [owner, id],
    };

    const result = await this.pool.query(query);

    return result.rows[0];
  }

  async removeSongFromPlaylistById(playlistId, { songId }) {
    await this.verifyPlaylist(playlistId);
    await this.songService.getSongById(songId);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu dari playlist, Id tidak ditemukan');
    }
  }

  async verifyPlaylist(id) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, { owner }) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
