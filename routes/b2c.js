import express from "express";
import b2cController from "../controller/b2cController.js";

const router = express.Router();

//b2c routes goes here ...
router.get("/test", b2cController.test);
router.post("/register", b2cController.register);
router.post("/login", b2cController.login);

// router.get("/customer", b2cController.getAllCustomers);
// router.post("/customer", b2cController.addCustomer);

export default router;
