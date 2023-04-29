const Joi = require('joi');

const CollaborationSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { CollaborationSchema };
