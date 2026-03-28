const jwt = require("jsonwebtoken");

function getJwtSecret() {
  // Local dev fallback. For production, you should set JWT_SECRET.
  return process.env.JWT_SECRET || "dev_jwt_secret_change_me";
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired auth token" });
  }
}

module.exports = { requireAuth };

