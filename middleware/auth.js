import jwt from "jsonwebtoken";

const authentication = function (req, res, next) {
  const security = process.env.SECURITY;
  const accessTokenKey = process.env.ACCESS_TOKEN_JWT_SECRET_KEY;

  if (security === "false") return next();

  const accessToken = req.cookies["accessToken"];

  try {
    const decoded = jwt.verify(accessToken, accessTokenKey);
    req.user = decoded;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({
        message: "Unauthenticated user ...",
        error: error,
        success: false,
      });
  }
};

const decodeRefreshToken = function (req, res, next) {
  const refreshTokenKey = process.env.REFRESH_TOKEN_JWT_SECRET_KEY;

  const refreshToken = req.cookies["refreshToken"];
  try {
    const decoded = jwt.verify(refreshToken, refreshTokenKey);
    req.refreshTokenData = decoded;
    return next();
  } catch (error) {
    console.log("error is ", error);
    return res
      .status(401)
      .json({
        message: "Session Expired. Please Login again ...",
        error,
        success: false,
      });
  }
};

export { decodeRefreshToken, authentication };
