const express = require("express");
const router = express.Router();

const { signup, login, logout } = require("../controllers/authController");
const { signupValidator, loginValidator } = require("../validators/authValidators");
const validate = require("../middleware/validate");
const { loginLimiter } = require("../middleware/rateLimiter");

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginLimiter, loginValidator, validate, login);
router.post("/logout", logout);

module.exports = router;
