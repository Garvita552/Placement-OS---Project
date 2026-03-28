const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");

const router = express.Router();

const DB_ERROR =
  "Database not connected. Start MongoDB (Windows: Services → MongoDB Server → Start), then wait a few seconds or restart: cd backend && npm start";

function requireDb(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({ error: DB_ERROR });
}

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
  const payload = { sub: user._id.toString(), username: user.username };
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

router.post("/register", requireDb, async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({ error: "Enter a valid username (min 3 chars)." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Enter a valid password (min 6 chars)." });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), passwordHash });

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, username: user.username } });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Register failed." });
  }
});

router.post("/login", requireDb, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Missing credentials." });

    const user = await User.findOne({ username: username.trim() });
    if (!user) return res.status(401).json({ error: "Invalid username or password." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid username or password." });

    const token = signToken(user);
    return res.status(200).json({ token, user: { id: user._id, username: user.username } });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Login failed." });
  }
});

router.get("/me", async (req, res) => {
  // Optional route; requireAuth handles jwt.
  return res.json({ ok: true });
});

module.exports = router;

