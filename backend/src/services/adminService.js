const requestRepository = require("../repositories/requestRepository");
const userRepository = require("../repositories/userRepository");
const logRepository = require("../repositories/logRepository");
const auditRepository = require("../repositories/auditRepository");
const Statuses = require("../constants/statuses");
const AuditTargets = require("../constants/auditTargets");
const { createPassCode } = require("../utils/passcode");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError
} = require("../errors");

class AdminService {
  async getAllRequests() {
    return requestRepository.findAllPopulated();
  }

  async overrideStatus(requestId, status, adminId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (!Object.values(Statuses).includes(status)) {
      throw new ValidationError(`Invalid request status: ${status}`);
    }

    const updated = await requestRepository.update(requestId, { status });

    await auditRepository.create({
      action: "override_status",
      admin: adminId,
      targetType: AuditTargets.REQUEST,
      targetId: requestId,
      metadata: { newStatus: status }
    });

    return updated;
  }

  async approveRequest(requestId, adminId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.status !== Statuses.PENDING) {
      throw new ConflictError(`Request is already ${request.status}`);
    }

    const code = createPassCode();
    await requestRepository.update(requestId, {
      status: Statuses.APPROVED,
      passCode: code
    });

    await auditRepository.create({
      action: "approve_request",
      admin: adminId,
      targetType: AuditTargets.REQUEST,
      targetId: requestId
    });

    return code;
  }

  async rejectRequest(requestId, adminId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.status !== Statuses.PENDING) {
      throw new ConflictError(`Request is already ${request.status}`);
    }

    await requestRepository.update(requestId, { status: Statuses.REJECTED });

    await auditRepository.create({
      action: "reject_request",
      admin: adminId,
      targetType: AuditTargets.REQUEST,
      targetId: requestId
    });
  }

  async forceEntry(requestId, adminId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    let log = await logRepository.findByRequestId(requestId);
    const now = new Date();

    if (!log) {
      await logRepository.create({
        visitRequest: requestId,
        inTime: now
      });
    } else {
      await logRepository.update(log._id, { inTime: now });
    }

    await auditRepository.create({
      action: "force_entry",
      admin: adminId,
      targetType: AuditTargets.REQUEST,
      targetId: requestId
    });
  }

  async forceExit(requestId, adminId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Request not found");
    }

    const log = await logRepository.findByRequestId(requestId);
    if (!log || !log.inTime) {
      throw new ValidationError("No entry record found for this request. Cannot mark exit.");
    }

    const now = new Date();
    await logRepository.update(log._id, { outTime: now });

    await auditRepository.create({
      action: "force_exit",
      admin: adminId,
      targetType: AuditTargets.REQUEST,
      targetId: requestId
    });
  }

  async getAuditLogs() {
    return auditRepository.findAllPopulated();
  }

  async getAllUsers() {
    return userRepository.findAll();
  }

  async suspendUser(userId, adminId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user._id.toString() === adminId.toString()) {
      throw new ForbiddenError("Cannot suspend yourself");
    }

    await userRepository.update(userId, { isSuspended: true });

    await auditRepository.create({
      action: "suspend_user",
      admin: adminId,
      targetType: AuditTargets.USER,
      targetId: userId
    });
  }

  async activateUser(userId, adminId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await userRepository.update(userId, { isSuspended: false });

    await auditRepository.create({
      action: "activate_user",
      admin: adminId,
      targetType: AuditTargets.USER,
      targetId: userId
    });
  }
}

module.exports = new AdminService();
