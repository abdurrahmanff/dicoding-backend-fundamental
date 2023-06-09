const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this.pool = new Pool();
  }

  async getPlaylistById(id) {
    const queryPlaylist = {
      text: `SELECT id, name
      FROM playlists
      WHERE id = $1`,
      values: [id],
    };

    const resultPlaylist = await this.pool.query(queryPlaylist);

    const querySongs = {
      text: `SELECT s.id, s.title, s.performer
      FROM songs as s
      INNER JOIN playlist_songs AS ps ON ps.song_id = s.id
      WHERE ps.playlist_id = $1`,
      values: [resultPlaylist.rows[0].id],
    };

    const resultSongs = await this.pool.query(querySongs);
    const songs = resultSongs.rows;

    const result = {
      playlist: {
        ...resultPlaylist.rows[0],
        songs,
      },
    };

    return result;
  }
}

module.exports = PlaylistsService;
