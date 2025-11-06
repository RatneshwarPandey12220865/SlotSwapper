import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import swapRoutes from "./routes/swaps.js";
import { initDatabase } from "./config/initDatabase.js";
import "./config/redis.js"; // Initialize Redis connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const origins = [allowedOrigin, "https://slot-swapper-neon.vercel.app"];
    if (origins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Create and configure router
const router = express.Router();
router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/", swapRoutes);

// Mount all routes under /api
app.use("/api", router);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SlotSwapper API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
