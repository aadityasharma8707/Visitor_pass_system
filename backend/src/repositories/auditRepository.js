const AuditLog = require("../models/AuditLog");

class AuditRepository {
  async create(auditData) {
    const log = new AuditLog(auditData);
    return log.save();
  }

  async findAllPopulated() {
    return AuditLog.find()
      .populate("admin", "name email role")
      .sort({ createdAt: -1 });
  }
}

module.exports = new AuditRepository();
