const authService = require("../services/authService");
const { getAdminFromHeader } = require("../middleware/authMiddleware");
const { UserDTO } = require("../dtos");

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const adminRequester = await getAdminFromHeader(req);

      const user = await authService.register({
        name,
        email,
        password,
        role
      }, adminRequester);

      res.status(201).json({
        message: "User created",
        user: UserDTO.toResponse(user)
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        message: "Login successful",
        token: result.token,
        user: UserDTO.toResponse(result.user),
        role: result.role
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
