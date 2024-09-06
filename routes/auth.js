import express from "express";
import authController from "../controller/authController.js";
import { decodeRefreshToken } from "../middleware/auth.js";

const router = express.Router();

// auth related routes goes here ...
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get(
  "/regenerateToken",
  decodeRefreshToken,
  authController.regenerateAccessToken
);

export default router;
