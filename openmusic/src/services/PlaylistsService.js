const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const { MapPlaylistDbToModel, MapPlaylistSongsDbToModel } = require('../utils');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistsService {
  constructor(songService) {
    this.pool = new Pool();
    this.songService = songService;
  }

  async addPlaylist({ name }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, name, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal membuat playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylists() {
    const query = 'SELECT id, name, owner FROM playlists';
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

  async getPlaylistById(id) {
    await this.verifyPlaylist(id);

    const query = {
      text: `SELECT 
      playlists.id, playlists.name, playlists.owner, playlist_songs.* 
      FROM playlists AS p
      LEFT JOIN playlist_songs AS ps ON p.id = ps.playlist_id
      WHERE ps.id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);

    return result.rows.map(MapPlaylistSongsDbToModel)[0];
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
}

module.exports = PlaylistsService;
