const express = require("express");
const VisitRequest = require("../models/VisitRequest");
const EntryLog = require("../models/EntryLog");
const AuditLog = require("../models/AuditLog");
const User = require("../models/user");

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

/* ================= FORCE STATUS ================= */
router.post("/override-status/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await VisitRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const previous = request.status;
    request.status = status;
    await request.save();

    await AuditLog.create({
      admin: req.user.id,
      action: "override-status",
      targetType: "Request",
      targetId: request._id,
      metadata: {
        previousStatus: previous,
        newStatus: status
      }
    });

    res.json({ message: "Status overridden by admin" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= FORCE ENTRY ================= */
router.post("/force-entry/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const request = await VisitRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    let log = await EntryLog.findOne({ visitRequest: request._id });

    if (!log) {
      log = await EntryLog.create({
        visitRequest: request._id,
        inTime: new Date()
      });
    } else {
      log.inTime = new Date();
      await log.save();
    }

    await AuditLog.create({
      admin: req.user.id,
      action: "force-entry",
      targetType: "Request",
      targetId: request._id,
    });

    res.json({ message: "Entry forced by admin" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= FORCE EXIT ================= */
router.post("/force-exit/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const log = await EntryLog.findOne({ visitRequest: req.params.id });

    if (!log) {
      return res.status(400).json({ message: "No entry log found" });
    }

    log.outTime = new Date();
    await log.save();

    await AuditLog.create({
      admin: req.user.id,
      action: "force-exit",
      targetType: "Request",
      targetId: req.params.id
    });

    res.json({ message: "Exit forced by admin" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET AUDIT LOG ================= */
router.get("/audit-log", auth, allowRoles("admin"), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("admin", "name email")
      .populate("visitRequest")
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET USERS ================= */
router.get("/users", auth, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
