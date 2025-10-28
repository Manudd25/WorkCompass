import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import applicationsRoutes from "./routes/applications.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import wellnessRoutes from "./routes/wellness.js";
import connectDB from "./config/db.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "https://www.workcompass.net",
    "https://workcompass.net",
    "http://localhost:5173", // For local development
    "http://localhost:5174", // Alternative local port
    "http://localhost:3000",  // Alternative local port
    "https://workcompass.netlify.app",
    "https://68ed3360cbf69b531b9f96a7--workcompassapp.netlify.app",
    "https://workcompass-aubna8bcgub5f3bt.westeurope-01.azurewebsites.net"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));


app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("WorkCompass API is running...");
});

// Routes
app.use("/api/auth", authRoutes); // signup/login
app.use("/api/applications", applicationsRoutes); // CRUD routes protected by authMiddleware
app.use("/api/ai", aiRoutes); // AI features routes protected by authMiddleware
app.use("/api/wellness", wellnessRoutes); // Wellness routes protected by authMiddleware

// Direct feedback route (public)
app.post("/api/feedback", async (req, res) => {
  try {
    const { submitFeedback } = await import("./controllers/authController.js");
    await submitFeedback(req, res);
  } catch (error) {
    console.error("Error importing submitFeedback:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'POST /api/ai/guest-chat',
      'GET /api/applications',
      'GET /api/wellness/mood-entries'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
