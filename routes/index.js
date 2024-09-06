import express from "express";
import deviceDetails from "./../controller/deviceDetails.js";
import deviceDetailusingDeviceId from "../controller/deviceDetailusingDeviceId.js";

const router = express.Router();

// all devices details
router.get("/device-details", deviceDetails);

// device details using deviceId
router.get("/device-detail", deviceDetailusingDeviceId);

export default router;
