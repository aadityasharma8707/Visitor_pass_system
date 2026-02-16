const mongoose = require("mongoose");

const entryLogSchema = new mongoose.Schema(
  {
    visitRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitRequest",
      required: true,
      unique: true,
      index: true
    },
    inTime: {
      type: Date,
      default: null
    },
    outTime: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

entryLogSchema.pre("save", function () {
  if (this.outTime && !this.inTime) {
    throw new Error("Cannot set outTime without inTime");
  }

  if (this.inTime && this.outTime && this.outTime < this.inTime) {
    throw new Error("outTime cannot be before inTime");
  }
});

module.exports = mongoose.model("EntryLog", entryLogSchema);
