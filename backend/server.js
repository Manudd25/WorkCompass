import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import applicationsRoutes from "./routes/applications.js";
import authRoutes from "./routes/auth.js";
import connectDB from "./config/db.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "https://workcompassapp.z6.web.core.windows.net",
    "http://localhost:5173", // For local development
    "http://localhost:3000"  // Alternative local port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("WorkCompass API is running...");
});

// Routes
app.use("/api/auth", authRoutes); // signup/login
app.use("/api/applications", applicationsRoutes); // CRUD routes protected by authMiddleware

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
