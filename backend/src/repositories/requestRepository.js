const VisitRequest = require("../models/VisitRequest");
const Statuses = require("../constants/statuses");

class RequestRepository {
  async create(requestData, options = {}) {
    const created = await VisitRequest.create([requestData], options);
    return created[0];
  }

  async findById(id) {
    return VisitRequest.findById(id).populate("visitor").populate("host");
  }

  async findPendingByHost(hostId) {
    return VisitRequest.find({ host: hostId, status: Statuses.PENDING })
      .populate("visitor")
      .sort({ createdAt: -1 })
      .lean();
  }

  async findApprovedWithLogs() {
    // Return all requests that are approved, and lookup their corresponding entry/exit log
    // We can populate visitor & host and return the list.
    // The logs lookup will be handled in the controller/service by joining or sub-querying.
    return VisitRequest.find({ status: Statuses.APPROVED })
      .populate("visitor")
      .populate("host")
      .sort({ visitDate: -1 })
      .lean();
  }

  async findAllPopulated() {
    return VisitRequest.find()
      .populate("visitor")
      .populate("host")
      .sort({ createdAt: -1 })
      .lean();
  }

  async update(id, updateData, options = {}) {
    return VisitRequest.findByIdAndUpdate(id, updateData, { new: true, ...options });
  }
}

module.exports = new RequestRepository();
