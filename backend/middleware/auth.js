const jwt = require("jsonwebtoken");
const User = require("../models/user");

function auth(req, res, next) {

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    User.findById(decoded.id)
      .then(user => {

        if (!user) {
          return res.status(401).json({ message: "User no longer exists" });
        }

        if (user.isSuspended) {
          return res.status(403).json({ message: "Account suspended" });
        }

        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        return next();
      })
      .catch(err => {
        return res.status(401).json({ message: err.message });
      });

  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

module.exports = auth;
