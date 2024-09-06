import axios from "axios";

async function deviceDetailusingDeviceId(req, res) {
  try {
    const deviceId = req.query.deviceId;
    const resp = await axios.get(
      `https://config.iot.mrmprocom.com/php-admin/getDeviceUsingQR.php?deviceQRCode=${deviceId}`
    );
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(400).json({
      msg: error.message || error,
      error: true,
      success: false,
    });
  }
}

export default deviceDetailusingDeviceId;
