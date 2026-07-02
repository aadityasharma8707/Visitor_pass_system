const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../middleware/validationMiddleware");
const { registerSchema, loginSchema } = require("../validations/authValidation");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
