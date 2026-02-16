const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
    },

    idProof: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("Visitor", visitorSchema);
  
