const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const config = require("./src/config/config");
const apiRoutes = require("./src/routes/index");
const healthRoute = require("./src/routes/healthRoute");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const { requestContextMiddleware } = require("./src/middleware/requestContext");
const standardResponseMiddleware = require("./src/middleware/standardResponse");

const app = express();

// 1️⃣ Request correlation context and standard responses
app.use(requestContextMiddleware);
app.use(standardResponseMiddleware);

// 2️⃣ Standard payload parsers
app.use(express.json({ limit: "100kb" }));
app.use(cors({
  origin: config.corsOrigin
}));

// 3️⃣ Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// 4️⃣ Router Mounts
app.use(healthRoute);
app.use("/api/v1", apiRoutes);
app.use("/api", apiRoutes); // Backward compatibility

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 5️⃣ Error Handler
app.use(errorMiddleware);

// 6️⃣ Database Connection
mongoose
  .connect(config.mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err.message));

// 7️⃣ Server Startup
app.listen(config.port, () => {
  console.log("Server started on port", config.port);
});
