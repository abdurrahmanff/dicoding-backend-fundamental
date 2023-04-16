const Joi = require('joi');

const NotePayloadSchema = Joi.object({
  body: Joi.string().required(),
  title: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
});

module.exports = NotePayloadSchema;
