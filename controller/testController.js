import { MgmtDevice } from "../models/Device.js";

async function base(req, res) {
  return res.send("All is Well !!!");
}

async function allDevice(req, res) {
  const devices = await MgmtDevice.find({});
  res.status(200).json({msg : "", success : true, data : devices})
}

export default {
  base,
  allDevice
};
