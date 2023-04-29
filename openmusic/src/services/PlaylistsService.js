const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const AuthorizationError = require('../exceptions/AuthorizationError');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistsService {
  constructor(songsService, collaborationsService) {
    this.pool = new Pool();
    this.songsService = songsService;
    this.collaborationsService = collaborationsService;
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
      text: `SELECT p.id, p.name, u.username 
      FROM playlists AS p
      JOIN users AS u ON p.owner = u.id
      LEFT JOIN collaborations AS c ON p.id = c.playlist_id
      WHERE p.owner = $1 OR c.user_id = $1`,
      values: [owner],
    };
    const result = await this.pool.query(query);

    return result.rows;
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
    await this.songsService.getSongById(songId);

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

    const queryPlaylist = {
      text: `SELECT p.id, p.name, u.username
      FROM playlists AS p
      JOIN users AS u ON p.owner = u.id
      LEFT JOIN collaborations AS c ON p.id = c.playlist_id
      WHERE (p.owner = $2 OR c.user_id = $2) AND p.id = $1`,
      values: [id, owner],
    };

    const resultPlaylist = await this.pool.query(queryPlaylist);
    const playlist = resultPlaylist.rows[0];

    const querySongs = {
      text: `SELECT s.id, s.title, s.performer
      FROM songs as s
      INNER JOIN playlist_songs AS ps ON ps.song_id = s.id
      WHERE ps.playlist_id = $1`,
      values: [playlist.id],
    };

    const resultSongs = await this.pool.query(querySongs);
    const songs = resultSongs.rows;

    const result = {
      ...playlist,
      songs,
    };

    return result;
  }

  async removeSongFromPlaylistById(playlistId, { songId }) {
    await this.verifyPlaylist(playlistId);
    await this.songsService.getSongById(songId);

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
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, { owner: userId });
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw e;
      }
      try {
        await this.collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw e;
      }
    }
  }

  async logActivity(playlistId, songId, action, userId) {
    const id = `psa-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    await this.pool.query(query);
  }

  async getLogActivities(playlistId) {
    this.verifyPlaylist(playlistId);

    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time
      FROM playlist_song_activities AS psa
      JOIN songs AS s ON psa.song_id = s.id
      JOIN users AS u ON psa.user_id = u.id
      WHERE psa.playlist_id = $1
      GROUP BY u.username, s.title, psa.action, psa.time
      ORDER BY psa.time ASC`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    return {
      playlistId,
      activities: result.rows,
    };
  }
}

module.exports = PlaylistsService;
