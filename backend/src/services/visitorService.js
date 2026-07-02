const mongoose = require("mongoose");
const userRepository = require("../repositories/userRepository");
const visitorRepository = require("../repositories/visitorRepository");
const requestRepository = require("../repositories/requestRepository");
const logRepository = require("../repositories/logRepository");
const Roles = require("../constants/roles");
const Statuses = require("../constants/statuses");
const { createPassCode } = require("../utils/passcode");
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError
} = require("../errors");

class VisitorService {
  async getActiveHosts() {
    return userRepository.findHosts();
  }

  async createRequest(data) {
    const { name, phone, idProof, hostId, purpose, visitDate } = data;

    if (!name || !phone || !hostId || !purpose || !visitDate) {
      throw new ValidationError("Missing required fields");
    }

    if (!/^\d{10}$/.test(phone)) {
      throw new ValidationError("Phone must be 10 digits");
    }

    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      throw new ValidationError("Invalid host ID");
    }

    const host = await userRepository.findById(hostId);
    if (!host || host.role !== Roles.HOST || host.isSuspended) {
      throw new ValidationError("Host not found or unavailable");
    }

    const visit = new Date(visitDate);
    if (isNaN(visit.getTime())) {
      throw new ValidationError("Invalid visit date");
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const visitStr = visit.toISOString().split("T")[0];
    if (visitStr < todayStr) {
      throw new ValidationError("Visit date cannot be in the past");
    }

    const isReplicaSet = mongoose.connection.client && 
                         mongoose.connection.client.topology && 
                         mongoose.connection.client.topology.description && 
                         mongoose.connection.client.topology.description.type !== "Single";

    const session = isReplicaSet ? await mongoose.startSession() : null;
    if (session) {
      session.startTransaction();
    }
    const options = session ? { session } : {};

    try {
      let visitor = await visitorRepository.findByPhone(phone);

      if (!visitor) {
        visitor = await visitorRepository.create({ name, phone, idProof }, options);
      }

      const request = await requestRepository.create({
        visitor: visitor._id,
        host: hostId,
        purpose,
        visitDate
      }, options);

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

      return request._id;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }

  async getHostRequests(hostId) {
    return requestRepository.findPendingByHost(hostId);
  }

  async approveRequest(requestId, hostId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.host._id.toString() !== hostId.toString()) {
      throw new ForbiddenError("Unauthorized to approve this request");
    }

    if (request.status !== Statuses.PENDING) {
      throw new ConflictError(`Request is already ${request.status}`);
    }

    const code = createPassCode();
    await requestRepository.update(requestId, {
      status: Statuses.APPROVED,
      passCode: code
    });

    return code;
  }

  async rejectRequest(requestId, hostId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.host._id.toString() !== hostId.toString()) {
      throw new ForbiddenError("Unauthorized to reject this request");
    }

    if (request.status !== Statuses.PENDING) {
      throw new ConflictError(`Request is already ${request.status}`);
    }

    await requestRepository.update(requestId, { status: Statuses.REJECTED });
  }

  async getApprovedRequestsWithLogs() {
    const requests = await requestRepository.findApprovedWithLogs();
    
    const requestIds = requests.map(r => r._id);
    const logs = await logRepository.findLogsForRequests(requestIds);
    
    const logsMap = new Map();
    logs.forEach(l => logsMap.set(l.visitRequest.toString(), l));

    return requests.map(request => {
      const log = logsMap.get(request._id.toString());
      return {
        ...request.toObject(),
        entryLog: log ? { inTime: log.inTime, outTime: log.outTime } : null
      };
    });
  }

  async markEntry(requestId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.status !== Statuses.APPROVED) {
      throw new ValidationError("Request is not approved");
    }

    let log = await logRepository.findByRequestId(requestId);
    if (log && log.inTime) {
      throw new ConflictError("Entry already marked for this visitor");
    }

    const now = new Date();
    if (!log) {
      log = await logRepository.create({
        visitRequest: requestId,
        inTime: now
      });
    } else {
      log = await logRepository.update(log._id, { inTime: now });
    }

    return log.inTime;
  }

  async markExit(requestId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    const log = await logRepository.findByRequestId(requestId);
    if (!log || !log.inTime) {
      throw new ValidationError("No entry record found for this request. Cannot mark exit.");
    }

    if (log.outTime) {
      throw new ConflictError("Exit already marked for this visitor");
    }

    const now = new Date();
    const updated = await logRepository.update(log._id, { outTime: now });
    return updated.outTime;
  }
}

module.exports = new VisitorService();
