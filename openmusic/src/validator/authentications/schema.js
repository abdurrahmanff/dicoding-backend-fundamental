const Joi = require('joi');

const postAuthentcationsSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const putAuthentcationsSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const deleteAuthentcationsSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  postAuthentcationsSchema,
  putAuthentcationsSchema,
  deleteAuthentcationsSchema,
};
