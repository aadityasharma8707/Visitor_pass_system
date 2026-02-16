const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth");
const visitorRoutes = require("./routes/visitor");
const adminRoutes = require("./routes/admin");


// 1️⃣ Initialize app FIRST
const app = express();

// 2️⃣ Middlewares
app.use(express.json());
app.use(cors());

// 3️⃣ Routes
app.use("/api/auth", authRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/admin", adminRoutes);

// 4️⃣ Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 5️⃣ DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err.message));

// 6️⃣ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});

