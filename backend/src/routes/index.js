const express = require("express");
const authRoutes = require("./authRoutes");
const visitorRoutes = require("./visitorRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/visitor", visitorRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
