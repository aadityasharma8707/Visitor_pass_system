const userRepository = require("../repositories/userRepository");
const { generateToken } = require("../utils/token");
const Roles = require("../constants/roles");
const {
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError
} = require("../errors");

class AuthService {
  async register(userData, adminRequester = null) {
    const userCount = await userRepository.count();

    if (userCount === 0) {
      if (userData.role !== Roles.ADMIN) {
        throw new ValidationError("First user must be an admin");
      }
    } else {
      if (!adminRequester || adminRequester.role !== Roles.ADMIN) {
        throw new ForbiddenError("Admin authorization required");
      }
    }

    const existing = await userRepository.findByEmail(userData.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const user = await userRepository.create(userData);
    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = userObj._id.toString();
    return userObj;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.isSuspended) {
      throw new ForbiddenError("Your account has been suspended");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = generateToken({ id: user._id, role: user.role });
    
    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = userObj._id.toString();

    return { token, user: userObj, role: user.role };
  }
}

module.exports = new AuthService();
