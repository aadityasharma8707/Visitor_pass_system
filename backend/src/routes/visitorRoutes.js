const express = require("express");
const visitorController = require("../controllers/visitorController");
const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const { createRequestSchema, paramsIdSchema } = require("../validations/visitorValidation");
const Roles = require("../constants/roles");

const router = express.Router();

router.get("/hosts", visitorController.getHosts);
router.post("/request", validate(createRequestSchema), visitorController.createRequest);

// Protected routes (Host role)
router.get(
  "/host/my-requests",
  authMiddleware,
  roleMiddleware(Roles.HOST),
  visitorController.getMyRequests
);
router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(Roles.HOST),
  validate(paramsIdSchema),
  visitorController.approve
);
router.put(
  "/reject/:id",
  authMiddleware,
  roleMiddleware(Roles.HOST),
  validate(paramsIdSchema),
  visitorController.reject
);

// Protected routes (Security role)
router.get(
  "/approved-with-logs",
  authMiddleware,
  roleMiddleware(Roles.SECURITY),
  visitorController.getApprovedWithLogs
);
router.post(
  "/entry/:id",
  authMiddleware,
  roleMiddleware(Roles.SECURITY),
  validate(paramsIdSchema),
  visitorController.entry
);
router.post(
  "/exit/:id",
  authMiddleware,
  roleMiddleware(Roles.SECURITY),
  validate(paramsIdSchema),
  visitorController.exit
);

module.exports = router;
