const jwt = require('jsonwebtoken');
const { getEnvVar } = require('../utils/getEnvVar');
const tokenModel = require('../models/token-model');

class TokenService {

  generateTokens(payload) {
    const accessToken = jwt.sign(payload, getEnvVar('JWT_ACCESS_SECRET'), {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(payload, getEnvVar('JWT_REFRESH_SECRET'), {
      expiresIn: '30d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, getEnvVar('JWT_ACCESS_SECRET'));
      return userData
    } catch (error) {
      console.log(error)
    }
  }
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, getEnvVar('JWT_REFRESH_SECRET'));
      return userData
    } catch (error) {
      
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken) {
    const tokenData = await tokenModel.deleteOne({refreshToken})
    return tokenData

  }

  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({refreshToken})
    return tokenData

  }


}

module.exports = new TokenService();
