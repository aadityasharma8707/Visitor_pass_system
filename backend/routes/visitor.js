const express = require("express");
const mongoose = require("mongoose");

const Visitor = require("../models/Visitor");
const VisitRequest = require("../models/VisitRequest");
const EntryLog = require("../models/EntryLog");

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

/* ================= CREATE REQUEST ================= */
router.post("/request", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, phone, idProof, hostId, purpose, visitDate } = req.body;

    if (!name || !phone || !hostId || !purpose || !visitDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/^\d{10}$/.test(phone)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid host ID" });
    }

    const visit = new Date(visitDate);
    if (isNaN(visit.getTime())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid visit date" });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const visitStr = visit.toISOString().split("T")[0];

    if (visitStr < todayStr) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Visit date cannot be in the past" });
    }

    let visitor = await Visitor.findOne({ phone });

    if (!visitor) {
      visitor = await Visitor.create(
        [{ name, phone, idProof }],
        { session }
      );
      visitor = visitor[0];
    }

    const request = await VisitRequest.create(
      [{
        visitor: visitor._id,
        host: hostId,
        purpose,
        visitDate
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Visit request created",
      requestId: request[0]._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

/* ================= HOST VIEW OWN REQUESTS ================= */
router.get(
  "/host/my-requests",
  auth,
  allowRoles("host"),
  async (req, res) => {
    try {
      const requests = await VisitRequest.find({ host: req.user.id })
        .populate("visitor")
        .sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ================= APPROVE ================= */
router.put(
  "/approve/:id",
  auth,
  allowRoles("host"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await VisitRequest.findById(req.params.id);

      if (!request)
        return res.status(404).json({ message: "Request not found" });

      if (!request.host.equals(req.user.id))
        return res.status(403).json({ message: "Unauthorized" });

      const passCode =
        "PASS-" + Date.now().toString(36).toUpperCase();

      request.status = "approved";
      request.passCode = passCode;

      await request.save();

      res.json({ message: "Approved", passCode });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ================= REJECT ================= */
router.put(
  "/reject/:id",
  auth,
  allowRoles("host"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await VisitRequest.findById(req.params.id);

      if (!request)
        return res.status(404).json({ message: "Request not found" });

      if (!request.host.equals(req.user.id))
        return res.status(403).json({ message: "Unauthorized" });

      request.status = "rejected";
      await request.save();

      res.json({ message: "Rejected" });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ================= SECURITY VIEW ================= */
router.get(
  "/approved-with-logs",
  auth,
  allowRoles("security"),
  async (req, res) => {
    try {
      const requests = await VisitRequest.find({ status: "approved" })
        .populate("visitor host")
        .sort({ createdAt: -1 });

      const logs = await EntryLog.find({
        visitRequest: { $in: requests.map(r => r._id) }
      });

      const logMap = {};
      logs.forEach(l => {
        logMap[l.visitRequest.toString()] = l;
      });

      const result = requests.map(r => ({
        ...r.toObject(),
        entryLog: logMap[r._id.toString()] || null
      }));

      res.json(result);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ================= ENTRY ================= */
router.post(
  "/entry/:id",
  auth,
  allowRoles("security"),
  async (req, res) => {
    try {

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await VisitRequest.findById(req.params.id);

      if (!request || request.status !== "approved") {
        return res.status(400).json({ message: "Invalid request" });
      }

      const today = new Date().toISOString().split("T")[0];
      const visit = new Date(request.visitDate).toISOString().split("T")[0];

      if (visit !== today) {
        return res.status(400).json({ message: "Visit date mismatch" });
      }

      let log = await EntryLog.findOne({
        visitRequest: request._id
      });

      if (log && log.inTime) {
        return res.status(400).json({ message: "Entry already marked" });
      }

      if (!log) {
        log = await EntryLog.create({
          visitRequest: request._id,
          inTime: new Date()
        });
      } else {
        log.inTime = new Date();
        await log.save();
      }

      res.json({ message: "Entry marked", inTime: log.inTime });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ================= EXIT ================= */
router.post(
  "/exit/:id",
  auth,
  allowRoles("security"),
  async (req, res) => {
    try {

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await VisitRequest.findById(req.params.id);

      if (!request || request.status !== "approved") {
        return res.status(400).json({ message: "Invalid request" });
      }

      const log = await EntryLog.findOne({
        visitRequest: request._id
      });

      if (!log || !log.inTime) {
        return res.status(400).json({ message: "Entry not found" });
      }

      if (log.outTime) {
        return res.status(400).json({ message: "Exit already marked" });
      }

      log.outTime = new Date();
      await log.save();

      res.json({ message: "Exit marked", outTime: log.outTime });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
