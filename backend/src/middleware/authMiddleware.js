const { verifyToken } = require("../utils/token");
const userRepository = require("../repositories/userRepository");

async function getAdminFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.id);
    if (!user || user.role !== "admin" || user.isSuspended) {
      return null;
    }
    return user;
  } catch (err) {
    return null;
  }
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { authMiddleware, getAdminFromHeader };
