const Visitor = require("../models/Visitor");

class VisitorRepository {
  async findByPhone(phone) {
    return Visitor.findOne({ phone }).lean();
  }

  async create(visitorData, options = {}) {
    // If it's a bulk/array payload, Mongoose create handles it
    const created = await Visitor.create([visitorData], options);
    return created[0];
  }
}

module.exports = new VisitorRepository();
