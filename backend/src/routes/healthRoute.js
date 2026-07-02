const express = require("express");
const mongoose = require("mongoose");
const config = require("../config/config");
const router = express.Router();

router.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = "down";
  if (dbState === 1) {
    dbStatus = "connected";
  } else if (dbState === 2) {
    dbStatus = "connecting";
  }

  const isHealthy = dbStatus === "connected";

  res.json({
    status: isHealthy ? "healthy" : "unhealthy",
    database: dbStatus,
    environment: config.env,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
