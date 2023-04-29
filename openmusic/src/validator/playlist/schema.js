const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required,
});

const PlaylistSongPlayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistPayloadSchema, PlaylistSongPlayloadSchema };
