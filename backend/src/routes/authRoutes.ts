import express from "express";
const router = express.Router();
import { signup, login, logout } from "../controllers/authController";
import { signupValidator, loginValidator } from "../validators/authValidators";
import validate from "../middleware/validate";
import { loginLimiter } from "../middleware/rateLimiter";
import authMiddleware from "../middleware/auth";

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginLimiter, loginValidator, validate, login);
router.post("/logout", authMiddleware as express.RequestHandler, logout);

export default router;