import express from "express";
import b2bController from "../controller/b2bController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authentication } from "../middleware/auth.js";

const router = express.Router();

//b2b routes goes here
router.get(
  "/device-detail",
  authMiddleware,
  b2bController.deviceDetailusingDeviceId
); //done
router.get("/devices-detail", authMiddleware, b2bController.deviceDetails);
router.post("/add-device", authMiddleware, b2bController.addDevice); //done
router.post("/activate-sim", authMiddleware, b2bController.activateSim); //done
router.post(
  "/resumefromsafecustody",
  authMiddleware,
  b2bController.resumeFromSafeCustody
); //done
router.post("/safe-custody", authMiddleware, b2bController.safeCustody); //done
router.get("/user-devices", authMiddleware, b2bController.getAllDevicesofUser); //done
router.post("/allow-access", authMiddleware, b2bController.allowAccess); //done
router.post("/deny-access", authMiddleware, b2bController.denyAccess); //done

export default router;
