import { body } from "express-validator";

export const signupValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email")
    .trim()
    .isEmail().withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6, max: 72 }).withMessage("Password must be 6-72 characters")
    .matches(/\S/).withMessage("Password cannot be only whitespace"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ max: 72 }).withMessage("Password cannot exceed 72 characters"),
];
