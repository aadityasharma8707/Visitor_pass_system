const adminService = require("../services/adminService");
const { UserDTO, VisitRequestDTO, AuditLogDTO } = require("../dtos");

class AdminController {
  async getRequests(req, res, next) {
    try {
      const requests = await adminService.getAllRequests();
      res.json(VisitRequestDTO.toResponseList(requests));
    } catch (error) {
      next(error);
    }
  }

  async overrideStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const request = await adminService.overrideStatus(id, status, req.user._id);
      res.json({
        message: "Status overridden",
        request: VisitRequestDTO.toResponse(request)
      });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const passCode = await adminService.approveRequest(id, req.user._id);
      res.json({
        message: "Request approved",
        passCode
      });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.rejectRequest(id, req.user._id);
      res.json({ message: "Request rejected" });
    } catch (error) {
      next(error);
    }
  }

  async forceEntry(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.forceEntry(id, req.user._id);
      res.json({ message: "Entry forced successfully" });
    } catch (error) {
      next(error);
    }
  }

  async forceExit(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.forceExit(id, req.user._id);
      res.json({ message: "Exit forced successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const logs = await adminService.getAuditLogs();
      res.json(AuditLogDTO.toResponseList(logs));
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await adminService.getAllUsers();
      res.json(UserDTO.toResponseList(users));
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.suspendUser(id, req.user._id);
      res.json({ message: "User suspended" });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.activateUser(id, req.user._id);
      res.json({ message: "User activated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
