const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// API should work from the same origin, but during local dev CORS can help.
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Ensure preflight requests are handled even when no explicit OPTIONS route exists.
// Express 5 is stricter about path patterns, so we use middleware instead.
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(200);
  return next();
});
app.use(express.json({ limit: "2mb" }));

// Serve the frontend directly from the Project folder.
const frontendRoot = path.join(__dirname, "..");
app.use(express.static(frontendRoot));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// Routes
const authRoutes = require("./routes/auth");
const trackerRoutes = require("./routes/tracker");
const plannerRoutes = require("./routes/planner");
const notesRoutes = require("./routes/notes");
const analyticsRoutes = require("./routes/analytics");
const aiRoutes = require("./routes/ai");
const timetableRoutes = require("./routes/timetable");
const curriculumRoutes = require("./routes/curriculum");

app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/curriculum", curriculumRoutes);

// For non-API routes, fall back to the frontend index.
// Express 5 doesn't like `app.get("*")` with path-to-regexp, so we use `app.use`.
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.sendFile(path.join(frontendRoot, "index.html"));
});

async function start() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/placement_os";
  const port = Number(process.env.PORT || 3000);

  // Listen immediately so /api/health works even if MongoDB is still starting or down.
  await new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.on("error", reject);
  });

  // eslint-disable-next-line no-console
  console.log(`Placement OS API: http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Open in browser: http://localhost:${port}/login.html (no Live Server needed)`);

  try {
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected.");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection failed:", err.message);
    // eslint-disable-next-line no-console
    console.error("→ Start MongoDB, then restart this terminal: cd backend && npm start");
  }
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Server start failed:", err);
  process.exit(1);
});

