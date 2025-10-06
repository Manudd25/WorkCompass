import express from "express";
import { signup, login, googleAuth, createCandidate, listCandidates, updateCandidate, deleteCandidate, getProfile, updateProfile, changePassword, deleteAccount, requestPasswordReset, resetPassword } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Profile management (authenticated users)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);
router.delete("/profile", authMiddleware, deleteAccount);

// Recruiter-only user management
router.post("/candidates", authMiddleware, createCandidate);
router.get("/candidates", authMiddleware, listCandidates);
router.put("/candidates/:id", authMiddleware, updateCandidate);
router.delete("/candidates/:id", authMiddleware, deleteCandidate);

export default router;

