import axios from "axios";
import { User } from "../models/User.js";
import { MgmtDevice, validateMgmtDevice } from "../models/Device.js";
import currentDateTime from "../helper/helper.js";

async function deviceDetailusingDeviceId(req, res) {
  try {
    const deviceId = req.query.deviceId;
    const validatedata = {
      deviceId: deviceId,
    };
    const validationError = await validateMgmtDevice(validatedata);
    if (validationError) {
      return res
        .status(400)
        .json({
          msg: "Incorrect device details",
          error: validationError.details,
          success: false,
        });
    }
    const resp = await axios.get(
      `https://config.iot.mrmprocom.com/php-admin/getDeviceUsingQR.php?deviceQRCode=${deviceId}`
    );
    if (resp?.status == 200) {
      return res
        .status(200)
        .json({ data: resp.data, msg: resp?.message, success: true });
    }
    return res
      .status(resp.status)
      .json({ data: resp?.data, msg: resp?.message, success: false });
  } catch (error) {
    console.log("Error in getting device details using device Id", error);
    return res.status(500).json({
      msg: error.message || error,
      error: true,
      success: false,
    });
  }
}

async function deviceDetails(req, res) {
  try {
    const response = await axios.get(
      "https://config.iot.mrmprocom.com/php-admin/getAllDevices.php"
    );
    return res
      .status(200)
      .json({ msg: response?.message, data: response.data, error: [] }); // Sending the response data back to the client if needed
  } catch (error) {
    res.status(400).json({
      msg: "failed to get device details",
      error: error || error.message,
      success: false,
    });
  }
}

const isDeviceIdPresent = (devices, searchId) => {
  return devices.some((device) => device.deviceId === searchId);
};

const isrequestedAlready = (arr, user) => {
  return arr.some((req) => req.email === user.email);
};

async function addDevice(req, res) {
  const deviceData = req.body;
  const validatedata = {
    deviceId: deviceData.deviceQRCode,
  };
  try {
    // Validate device data
    const validationError = await validateMgmtDevice(validatedata);
    if (validationError) {
      return res
        .status(400)
        .json({
          msg: "Incorrect device data",
          error: validationError.details,
          success: false,
        });
    }

    // Find the user and add the device ID
    const user = await User.findById({ _id: req?.user?._id });
    if (!user) {
      return res
        .status(401)
        .json({ msg: "Invalid credentials", success: false });
    }
    // check whether device already registered.
    if (isDeviceIdPresent(user.registeredDevices, validatedata.deviceId)) {
      return res
        .status(409)
        .json({ msg: "Device already added", success: false });
    }

    const isDeviceRegisteredAlready = await MgmtDevice.findOne({
      deviceId: validatedata.deviceId,
    });

    if (isDeviceRegisteredAlready) {
      if (isrequestedAlready(isDeviceRegisteredAlready.requestedUsers, user)) {
        return res
          .status(220)
          .json({
            msg: "Request sent already",
            error: "Already requested for this device",
            success: false,
          });
      }
      isDeviceRegisteredAlready.requestedUsers.push({
        _id: user._id,
        email: user.email,
        name: user.name,
      });
      await isDeviceRegisteredAlready.save();
      return res
        .status(202)
        .json({
          msg: "Request to access device is sent",
          error: [],
          success: true,
        });
    }
    user.registeredDevices.push({ deviceId: validatedata.deviceId });
    user.totalDevices += 1;

    await user.save();

    // Create a new device document in MgmtDevice collection

    const newDevice = new MgmtDevice(validatedata);

    newDevice.authorizedUsers.push({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: "admin",
    });
    newDevice.registerationDetail.push({
      registeredBy: {
        _id: user._id,
        name: user.name,
      },
      registeredOn: currentDateTime(),
    });

    await newDevice.save();
    return res
      .status(200)
      .json({
        msg: "Device Registered successfully...",
        success: true,
        error: [],
      });
  } catch (error) {
    console.error("Error registering device:", error.message);
    return res
      .status(500)
      .json({ msg: "Error in registering device", error: error.message });
  }
}

const updateMySQLDatabase = async (deviceData) => {
  try {
    deviceData.billingStart = currentDateTime();
    const response = await axios.post(
      "https://config.iot.mrmprocom.com/php-admin/editDevices.php",
      deviceData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating MySQL database:", error.message);
    throw new Error("unable to update database");
  }
};

const getAirtelToken = async () => {
  try {
    const response = await axios.post(
      "https://config.iot.mrmprocom.com/php-admin/getAccessToken.php"
    );
    return response?.data?.data?.data?.access_token;
  } catch (error) {
    console.error("Error obtaining Airtel token:", error.message);
    // return res.status(500).json({ msg: "unable to find accesstoken", success: false, error: error?.message || error })
    throw new Error("unable to get token from Airtel API");
  }
};

const updateAirtelKYC = async (token, deviceData) => {
  try {
    const response = await axios.post(
      "https://config.iot.mrmprocom.com/php-admin/KYCUpdate.php",
      deviceData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Airtel KYC:", error.message);
    // return res.status(500).json({ msg: "unable to update kyc", success: false, error: error || error?.message });
    throw new Error("unable to update kyc");
  }
};

async function activateSim(req, res) {
  console.log("req body ", req.body);

  try {
    const token = await getAirtelToken();
    const formData = new URLSearchParams();

    const activateSimResp = await axios.post(
      "https://config.iot.mrmprocom.com/php-admin/Activate.php",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res
      .status(200)
      .json({ msg: "sim activated successfully...", success: true, error: [] });
  } catch (error) {
    console.log("Error is", error);
    return res
      .status(500)
      .json({
        msg: "unable to activate sim",
        success: false,
        error: error || error.message,
      });
  }
}

async function resumeFromSafeCustody(req, res) {
  try {
    const token = await getAirtelToken();
    const formData = new URLSearchParams();
    formData.append("token", token);
    formData.append("simNo", simNo);
    formData.append("mobileNo", mobileNo);
    const resumeFromSafeCustodyResponse = await axios.post(
      "https://config.iot.mrmprocom.com/php-admin/ResumeFromSafeCustody.php",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res
      .status(200)
      .json({
        msg: "sim moved out of safe custody successfully.......",
        error: error,
        success: false,
      });
  } catch (error) {
    console.log("Error in resuming sim out of safe custody.....");
    throw error;
  }
}

async function safeCustody(req, res) {
  try {
    const token = await getAirtelToken();
    const safeCustodySimResp = await axios.post(
      `http://config.iot.mrmprocom.com/php-admin/SafeCustody.php?token=${token}&simNo=${simNo}&mobileNo=${mobileNo}`
    );
    return res
      .status(200)
      .json({
        msg: "sim moved to safe custody successfully...",
        error: [],
        success: true,
      });
  } catch (error) {
    console.log("Error occured", error);
    throw error;
  }
}

async function getAllDevicesofUser(req, res) {
  try {
    const findUser = await User.findOne({ email: req.user.email });
    if (!findUser) {
      return res
        .status(404)
        .json({
          msg: "user not found",
          success: false,
          error: ["user not found"],
        });
    }
    const data = {
      devices: findUser.registeredDevices,
    };
    const devices = await getDevices(findUser.registeredDevices);

    const userdevices = await axios.post(
      "http://config.iot.mrmprocom.com/php-admin/alldevicesofuser.php",
      data
    );

    if (userdevices.status == 200)
      return res
        .status(200)
        .json({
          msg: "received all devices of users...",
          data: userdevices?.data?.data,
          devices,
          success: true,
          error: [],
        });
    else {
      return res.status(userdevices.status).json({
        msg:
          userdevices?.data?.message ||
          "failed to retrieve devices from external API",
        success: false,
        error: userdevices.data.error || [],
      });
    }
  } catch (error) {
    console.error("Error in getAllDevicesofUser:", error);
    return res.status(500).json({
      msg: "Internal server error",
      success: false,
      error: [error.message || "An unexpected error occurred"],
    });
  }
}

async function getDevices(deviceIds) {
  try {
    // Extract deviceId values from the deviceIds array
    const ids = deviceIds?.map((device) => device.deviceId);

    // Query the database using the extracted device IDs
    const devices = await MgmtDevice.find({ deviceId: { $in: ids } });

    return devices;
  } catch (error) {
    console.error("Error fetching devices info:", error);
  }
}

async function allowAccess(req, res) {
  try {
    const adminUser = await User.findById({ _id: req.user._id });
    const device = req.query.deviceId;
    const devicedetail = await MgmtDevice.findOne({ deviceId: device });

    if (devicedetail) {
      const istrue = devicedetail.requestedUsers.find(
        (user) => user._id == req.query.user
      );

      if (istrue) {
        // Remove user from requestedUsers
        await MgmtDevice.updateOne(
          { deviceId: device },
          {
            $pull: { requestedUsers: { _id: req.query.user } },
            $push: { authorizedUsers: istrue }, // access allowed so requested user pushed in authorized users array.
          }
        );
        await MgmtDevice.updateOne(
          { deviceId: device },
          {
            $push: {
              registerationDetail: {
                registeredBy: istrue,
                registeredOn: currentDateTime(),
              },
            },
          }
        );

        const requestedUser = await User.findById({ _id: req.query.user });

        await User.findByIdAndUpdate(
          { _id: req.query.user },
          {
            $push: { registeredDevices: { deviceId: device } },
            $inc: { totalDevices: 1 },
          }
        );
        res
          .status(200)
          .json({
            msg: "Access allowed to device successfully and user updated.",
            error: [],
            success: true,
          });
      } else {
        res
          .status(200)
          .json({
            msg: "User not found in requested users",
            error: [],
            success: false,
          });
      }
    } else {
      res
        .status(404)
        .json({ msg: "Device not found", error: [], success: false });
    }
  } catch (error) {
    return res
      .status(400)
      .json({
        msg: "Error in allowing access to device",
        error: error,
        success: false,
      });
  }
}

async function denyAccess(req, res) {
  const user = req.query.user;
  const device = req.query.deviceId;

  try {
    await MgmtDevice.updateOne(
      { deviceId: device },
      {
        $pull: { requestedUsers: { _id: user } },
      }
    );

    res
      .status(200)
      .json({
        msg: "Access Denied successfully...",
        success: false,
        error: [],
      });
  } catch (error) {
    res
      .status(400)
      .json({
        msg: "Error in denying access to device",
        error: error,
        success: false,
      });
  }
}

export default {
  deviceDetailusingDeviceId,
  deviceDetails,
  addDevice,
  activateSim,
  resumeFromSafeCustody,
  safeCustody,
  getAllDevicesofUser,
  allowAccess,
  denyAccess,
};
