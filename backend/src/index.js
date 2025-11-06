import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js"; // app is your Express app from socket.js
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Use platform port or fallback for local dev
const PORT = process.env.PORT || 5000;

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------- CORS -------
const allowedOrigins = [
  "http://localhost:5173",              // Vite dev
  "http://localhost:3000",              // Next dev (if you ever use it)
  process.env.FRONTEND_ORIGIN,          // e.g. https://chatty-xi-two.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow REST tools / server-to-server with no origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  })
);

// Body & cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check (useful on Render)
app.get("/health", (_req, res) => res.status(200).send("OK"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend only if you intentionally build+ship it with the backend
// (On Render, you typically DON'T — Vercel serves the frontend.)
if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND === "true") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// DB + start
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    console.log("Allowed origins:", allowedOrigins);
  });
});
