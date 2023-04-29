const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, PlaylistSongPlayloadSchema } = require('./schema');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSongPlayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
