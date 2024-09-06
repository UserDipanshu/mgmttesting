import express from "express";
import testController from "../controller/testController.js";
import { authentication } from "../middleware/auth.js";

const router = express.Router();

// test route
router.get("/", authentication, testController.base);
router.get("/device/all", testController.allDevice)

export default router;
