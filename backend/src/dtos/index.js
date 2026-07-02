class UserDTO {
  static toResponse(user) {
    if (!user) return null;
    const userObj = typeof user.toObject === "function" ? user.toObject() : user;
    const idStr = userObj._id ? userObj._id.toString() : (userObj.id ? userObj.id.toString() : null);
    return {
      id: idStr,
      _id: idStr,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      isSuspended: !!userObj.isSuspended,
      createdAt: userObj.createdAt || null
    };
  }

  static toResponseList(users) {
    return Array.isArray(users) ? users.map(UserDTO.toResponse) : [];
  }
}

class VisitRequestDTO {
  static toResponse(request) {
    if (!request) return null;
    const reqObj = typeof request.toObject === "function" ? request.toObject() : request;
    const idStr = reqObj._id ? reqObj._id.toString() : (reqObj.id ? reqObj.id.toString() : null);

    let visitor = null;
    if (reqObj.visitor) {
      if (typeof reqObj.visitor === "object") {
        const vId = reqObj.visitor._id ? reqObj.visitor._id.toString() : (reqObj.visitor.id ? reqObj.visitor.id.toString() : null);
        visitor = {
          id: vId,
          _id: vId,
          name: reqObj.visitor.name,
          phone: reqObj.visitor.phone,
          idProof: reqObj.visitor.idProof
        };
      } else {
        visitor = reqObj.visitor.toString();
      }
    }

    let host = null;
    if (reqObj.host) {
      if (typeof reqObj.host === "object") {
        const hId = reqObj.host._id ? reqObj.host._id.toString() : (reqObj.host.id ? reqObj.host.id.toString() : null);
        host = {
          id: hId,
          _id: hId,
          name: reqObj.host.name,
          email: reqObj.host.email
        };
      } else {
        host = reqObj.host.toString();
      }
    }

    return {
      id: idStr,
      _id: idStr,
      visitor,
      host,
      purpose: reqObj.purpose,
      visitDate: reqObj.visitDate,
      status: reqObj.status,
      passCode: reqObj.passCode || null,
      entryLog: reqObj.entryLog || null,
      createdAt: reqObj.createdAt || null
    };
  }

  static toResponseList(requests) {
    return Array.isArray(requests) ? requests.map(VisitRequestDTO.toResponse) : [];
  }
}

class AuditLogDTO {
  static toResponse(log) {
    if (!log) return null;
    const logObj = typeof log.toObject === "function" ? log.toObject() : log;
    const idStr = logObj._id ? logObj._id.toString() : (logObj.id ? logObj.id.toString() : null);

    let admin = null;
    if (logObj.admin) {
      if (typeof logObj.admin === "object") {
        const aId = logObj.admin._id ? logObj.admin._id.toString() : (logObj.admin.id ? logObj.admin.id.toString() : null);
        admin = {
          id: aId,
          _id: aId,
          name: logObj.admin.name,
          email: logObj.admin.email
        };
      } else {
        admin = logObj.admin.toString();
      }
    }

    return {
      id: idStr,
      _id: idStr,
      action: logObj.action,
      admin,
      targetType: logObj.targetType,
      targetId: logObj.targetId ? logObj.targetId.toString() : null,
      metadata: logObj.metadata || {},
      createdAt: logObj.createdAt || null
    };
  }

  static toResponseList(logs) {
    return Array.isArray(logs) ? logs.map(AuditLogDTO.toResponse) : [];
  }
}

module.exports = {
  UserDTO,
  VisitRequestDTO,
  AuditLogDTO
};
