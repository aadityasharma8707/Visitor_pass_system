const EntryLog = require("../models/EntryLog");

class LogRepository {
  async findByRequestId(visitRequest) {
    return EntryLog.findOne({ visitRequest });
  }

  async findLogsForRequests(requestIds) {
    return EntryLog.find({ visitRequest: { $in: requestIds } }).lean();
  }

  async create(logData, options = {}) {
    const log = new EntryLog(logData);
    return log.save(options);
  }

  async update(id, updateData, options = {}) {
    return EntryLog.findByIdAndUpdate(id, updateData, { new: true, ...options });
  }
}

module.exports = new LogRepository();
