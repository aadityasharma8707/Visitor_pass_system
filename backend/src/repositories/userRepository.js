const User = require("../models/User");
const Roles = require("../constants/roles");

class UserRepository {
  async findById(id) {
    return User.findById(id);
  }

  async findByEmail(email) {
    return User.findOne({ email }).select("+password");
  }

  async count() {
    return User.countDocuments();
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findAll() {
    return User.find().sort({ createdAt: -1 });
  }

  async findHosts() {
    return User.find({ role: Roles.HOST, isSuspended: false })
      .select("name email")
      .sort({ name: 1 });
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new UserRepository();
