import { validateUser } from "../models/User.js";
import { User } from "../models/User.js";

async function login(req, res) {
  const credentials = req.body;
  
  let user = await User.findOne({ email: credentials.email });
  if (!user)
    return res
  .status(400)
  .json({ message: "Invalid Credentials ...", error: {}, success: false });
  
  if (user.password !== credentials.password) {
    return res
    .status(400)
    .json({ message: "Invalid Credentials ...", error: {}, success: false });
  }
  
  const { accessToken, refreshToken } = user.generateAuthToken(user);
  const newUser = { ...user, refreshToken };
  
  try {
    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });
    
    await User.findByIdAndUpdate(user._id, newUser);
    res.set("Access-Control-Allow-Origin", req.headers.origin);

    return res.status(201).json({
      message: "User logged in successfully ...",
      data: user,
      success: true,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while logging in !!!",
      error,
      success: false,
    });
  }
}

async function register(req, res) {
  const user = req.body;

  const error = await validateUser(user);
  if (error) {
    return res.status(400).json({
      error: error.details,
      success: false,
      message: "Error occured...",
    });
  }

  const alreadyExist = await User.findOne({ email: user.email });
  if (alreadyExist) {
    return res
      .status(409)
      .json({ message: "User already registered", success: false, error: {} });
  }

  // const saltRounds = 10;
  // const passwordHash = await bcrypt.hash(user.password, saltRounds);
  // if (!passwordHash) {
  //   return res.status(500).json({ msg: "Something went wrong", success: false });
  // }
  // user.password = passwordHash;
  // if (!user.registeredDevices || user.registeredDevices.length === 0) {
  //   user.registeredDevices = [];
  // }

  const newUser = new User({
    name: user.name,
    password: user.password,
    email: user.email,
    contactNumber: user.contactNumber,
  });

  try {
    const { accessToken, refreshToken } = newUser.generateAuthToken(newUser);

    newUser.refreshToken = refreshToken;

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 3 days
    });

    const savedUser = await newUser.save();

    res.set("Access-Control-Allow-Origin", req.headers.origin);

    return res.status(201).json({
      message: "User registered successfully",
      data: savedUser,
      success: true,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error saving user", error: error, success: false });
  }
}

async function logout(req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json({ msg: "Logged out successfully...", success: true, error: [] });
}

async function regenerateAccessToken(req, res) {
  const { email: userEmail } = req.refreshTokenData;
  const userRefreshToken = req.cookies["refreshToken"];
  const user = await User.findOne({ email: userEmail });

  if (!user)
    return res
      .status(400)
      .json({ success: false, error, message: "Invalid User ..." });

  if (user.refreshToken !== userRefreshToken)
    return res.status(401).json({
      success: false,
      error: {},
      message: "Invalid token, time to login again ...",
    });

  const { accessToken } = user.generateAuthToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    security: false,
  });

  res.status(200).json({
    message: "Successfully generated the accessToken ... ",
    data: [],
    success: true,
  });
}

export default {
  login,
  register,
  logout,
  regenerateAccessToken,
};
