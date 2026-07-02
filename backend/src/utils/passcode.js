const crypto = require("crypto");

function createPassCode() {
  return `PASS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}
module.exports = { createPassCode, generate: createPassCode };
