/* eslint-disable camelcase */

const MapAlbumDbToModel = ({
  id,
  name,
  year,
  created_at,
  updated_at,
  cover,
}) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
  coverUrl: `http://${process.env.HOST}:${process.env.PORT}/images/${cover}`,
});

const MapSongDbToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

const MapPlaylistDbToModel = ({
  id,
  name,
  owner,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  username: owner,
  createdAt: created_at,
  updatedAt: updated_at,
});

const MapPlaylistSongsDbToModel = ({
  id,
  name,
  owner,
  songs,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  username: owner,
  songs,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = {
  MapAlbumDbToModel, MapSongDbToModel, MapPlaylistDbToModel, MapPlaylistSongsDbToModel,
};
