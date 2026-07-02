const mongoose = require("mongoose");
const AuditTargets = require("../constants/auditTargets");

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
      enum: Object.values(AuditTargets),
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
auditSchema.index({ admin: 1, createdAt: -1 });
auditSchema.index({ targetType: 1, createdAt: -1 });
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditSchema);
