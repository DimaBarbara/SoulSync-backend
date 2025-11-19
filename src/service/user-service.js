const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const { getEnvVar } = require('../utils/getEnvVar');
const ApiError = require('../exceptions/api-error');

class UserService {

  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest('Email in use')
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();

    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
    });
    
    // ОШИБКА ТАЙМАУТА (ETIMEDOUT) НА RENDER:
    /*
    await mailService.sendActivationMail(email, `${getEnvVar('API_URL')}/api/activate/${activationLink}`);
    */
    
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }


  async activate(activationLink) {
    const user = await UserModel.findOne({activationLink})
    if(!user) {
      throw ApiError.BadRequest('Incorrect activation link')
    }
    user.isActivated = true;
    await user.save();

  }

  async login(email, password) {
    const user = await UserModel.findOne({email})
    if(!user) {
      throw ApiError.BadRequest('User not found')
    }
      const isPassEquals = await bcrypt.compare(password, user.password)
      if(!isPassEquals) {
        throw ApiError.BadRequest('Invalid password')
      }
      // if (!user.isActivated) { throw ApiError.BadRequest('Account not activated'); }
      
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return { ...tokens, user: userDto };

  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if(!refreshToken) {
      throw ApiError.Unauthorized()
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDatabase = await tokenService.findToken(refreshToken);
    if(!userData || !tokenFromDatabase) {
      throw ApiError.Unauthorized()
    }
    const user = await UserModel.findById(userData.id)
     const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return { ...tokens, user: userDto };
  }


  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();