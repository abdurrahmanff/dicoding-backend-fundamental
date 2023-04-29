const InvariantError = require('../../exceptions/InvariantError');
const { CollaborationSchema } = require('./schema');

const CollaborationValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationValidator;
