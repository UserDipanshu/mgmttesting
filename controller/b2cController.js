import { Customer, validateCustomer } from "../models/Customer.js";
import { MgmtDevice } from "../models/Device.js";

async function test(req, res) {
  return res.send("All is Well b2c !!!");
}

async function login(req, res) {}

async function register(req, res) {
  // validation of client's data
  const error = await validateCustomer(req.body);
  if (error)
    return res.status(400).json({
      msg: "Invalid details",
      error: error.details,
      success: false,
    });

  // validation of duplicate registeration
  const customer = await Customer.findOne({ email: req.body.email });
  if (customer)
    return res
      .status(400)
      .json({ msg: "User already exists", success: false, data: [] });

  // check to  see if device present or not
  const device = await MgmtDevice.findOne({ deviceId: req.body.deviceId });
  if (!device)
    return res
      .status(404)
      .json({ msg: "Device not found.", success: false, error: [] });

  // creating new customer
  const new_customer = new Customer({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    deviceId: req.body.deviceId,
  });

  // check if request is already present or not
  const prev_request = device.requestedCustomer.filter(
    (e) => e.email === req.body.email
  );

  try {
    if (prev_request.length === 0) {
      let new_req = {
        email: req.body.email,
        name: req.body.name,
      };
      device.requestedCustomer.push(new_req);
    }

    await device.save();
    await new_customer.save();
    return res
      .status(200)
      .json({
        msg: "Registeration successfull. A request to the admin for device permission is also sent",
        data: [],
        success: true,
      });
  } catch (error) {
    // remove the customer request from the device here...
    return res.status(500).json({
      msg: "Something went wrong.",
      error: error.message,
      success: false,
    });
  }
}

export default {
  test,
  login,
  register,
};
