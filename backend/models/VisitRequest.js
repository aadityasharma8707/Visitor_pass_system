const mongoose = require("mongoose");

const visitRequestSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
      index: true
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },

    visitDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: "Visit date cannot be in the past"
      }
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },

    passCode: {
      type: String,
      unique: true,
      sparse: true // allows null until approved
    }
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
visitRequestSchema.index({ host: 1, createdAt: -1 });

module.exports = mongoose.model("VisitRequest", visitRequestSchema);
  
