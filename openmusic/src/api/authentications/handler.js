const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.authenticationsService = authenticationsService;
    this.usersService = usersService;
    this.tokenManager = tokenManager;
    this.validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    this.validator.validatePostAuthenticationPayload(request.payload);
    const { username, password } = request.payload;

    const id = await this.usersService.verifyUserCredential(username, password);

    const acccessToken = await this.tokenManager.generateAccessToken({ id });
    const refreshToken = await this.tokenManager.generateRefreshToken({ id });

    await this.authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        acccessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    this.validator.validatePutAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;

    await this.authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = await this.tokenManager.verifyRefreshToken(refreshToken);

    const acccessToken = await this.tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      data: {
        acccessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    this.validator.validatePutAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;

    await this.authenticationsService.verifyRefreshToken(refreshToken);
    await this.authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
