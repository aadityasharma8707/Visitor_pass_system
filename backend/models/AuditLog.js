const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    targetType: {
      type: String,
      enum: ["request", "user"],
      required: true,
      index: true
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

/* ================= INDEX OPTIMIZATION ================= */

// Fast admin activity lookup
auditSchema.index({ admin: 1, createdAt: -1 });

// Fast filtering by target
auditSchema.index({ targetType: 1, createdAt: -1 });

// Default newest-first sort
auditSchema.index({ createdAt: -1 });

/* ================= SAFE EXPORT ================= */

module.exports = mongoose.model("AuditLog", auditSchema);

