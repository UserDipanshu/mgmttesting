import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  // Get token from header
  const accessToken = req.header("Authorization")?.split(" ")[1];
  // Check if not token
  if (!accessToken) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_JWT_SECRET_KEY
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
}

export { authMiddleware };
