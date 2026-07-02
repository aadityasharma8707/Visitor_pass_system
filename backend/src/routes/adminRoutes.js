const express = require("express");
const adminController = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const { paramsIdSchema } = require("../validations/visitorValidation");
const { overrideStatusSchema } = require("../validations/adminValidation");
const Roles = require("../constants/roles");

const router = express.Router();

// Apply admin locks to all sub-routes
router.use(authMiddleware);
router.use(roleMiddleware(Roles.ADMIN));

router.get("/requests", adminController.getRequests);
router.post(
  "/override-status/:id",
  validate(overrideStatusSchema),
  adminController.overrideStatus
);
router.post(
  "/request/:id/approve",
  validate(paramsIdSchema),
  adminController.approve
);
router.post(
  "/request/:id/reject",
  validate(paramsIdSchema),
  adminController.reject
);
router.post(
  "/force-entry/:id",
  validate(paramsIdSchema),
  adminController.forceEntry
);
router.post(
  "/force-exit/:id",
  validate(paramsIdSchema),
  adminController.forceExit
);
router.get("/audit", adminController.getAuditLogs);
router.get("/users", adminController.getUsers);
router.post(
  "/user/:id/suspend",
  validate(paramsIdSchema),
  adminController.suspendUser
);
router.post(
  "/user/:id/activate",
  validate(paramsIdSchema),
  adminController.activateUser
);

module.exports = router;
