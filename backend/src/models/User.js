const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Roles = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.HOST
    },
    isSuspended: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

/* ================= HASH PASSWORD ================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ================= PASSWORD COMPARE ================= */
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* ================= ACTIVE CHECK ================= */
userSchema.methods.isActive = function () {
  return !this.isSuspended;
};

module.exports = mongoose.model("User", userSchema);
