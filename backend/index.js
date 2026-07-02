const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const config = require("./src/config/config");
const apiRoutes = require("./src/routes/index");
const healthRoute = require("./src/routes/healthRoute");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const { requestContextMiddleware } = require("./src/middleware/requestContext");
const standardResponseMiddleware = require("./src/middleware/standardResponse");
const helmet = require("helmet");
const mongoose = require('mongoose');
const config = require('./src/config/config');
const app = require('./src/app');

// Health route at root for quick check
app.get('/', (req, res) => res.send('Backend is running'));

// Database Connection + Server Startup
mongoose
  .connect(config.mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo error:', err.message));

app.listen(config.port, () => {
  console.log('Server started on port', config.port);
});
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
