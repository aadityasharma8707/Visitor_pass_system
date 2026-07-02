const visitorService = require("../services/visitorService");
const { UserDTO, VisitRequestDTO } = require("../dtos");

class VisitorController {
  async getHosts(req, res, next) {
    try {
      const hosts = await visitorService.getActiveHosts();
      res.json(UserDTO.toResponseList(hosts));
    } catch (error) {
      next(error);
    }
  }

  async createRequest(req, res, next) {
    try {
      const requestId = await visitorService.createRequest(req.body);
      res.status(201).json({
        message: "Visit request created",
        requestId
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req, res, next) {
    try {
      const requests = await visitorService.getHostRequests(req.user._id);
      res.json(VisitRequestDTO.toResponseList(requests));
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const passCode = await visitorService.approveRequest(id, req.user._id);
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
      await visitorService.rejectRequest(id, req.user._id);
      res.json({ message: "Request rejected" });
    } catch (error) {
      next(error);
    }
  }

  async getApprovedWithLogs(req, res, next) {
    try {
      const enriched = await visitorService.getApprovedRequestsWithLogs();
      res.json(VisitRequestDTO.toResponseList(enriched));
    } catch (error) {
      next(error);
    }
  }

  async entry(req, res, next) {
    try {
      const { id } = req.params;
      const inTime = await visitorService.markEntry(id);
      res.json({
        message: "Entry marked",
        inTime
      });
    } catch (error) {
      next(error);
    }
  }

  async exit(req, res, next) {
    try {
      const { id } = req.params;
      const outTime = await visitorService.markExit(id);
      res.json({
        message: "Exit marked",
        outTime
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VisitorController();
