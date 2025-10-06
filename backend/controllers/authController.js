import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
// GitHub OAuth using authorization code flow

const makeJwt = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * REGISTER / SIGNUP
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, recruiterCompany } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    // Require company for recruiters
    if (role === "recruiter" && !recruiterCompany) {
      return res.status(400).json({ message: "Company is required for recruiters." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "candidate",
      recruiterCompany: role === "recruiter" ? recruiterCompany : null,
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error during signup." });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login." });
  }
};

/**
 * GOOGLE OAUTH (Token-based from frontend)
 */
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing Google idToken." });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Google auth error: Missing GOOGLE_CLIENT_ID env var");
      return res.status(500).json({ message: "Google auth not configured. Missing GOOGLE_CLIENT_ID." });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || payload.given_name || "User";
    const avatar = payload.picture || null;
    const googleId = payload.sub;

    let user = await User.findOne({ email });
    if (!user) {
      // For Google OAuth, default to candidate role
      // Recruiters should use regular signup form to specify company
      user = new User({
        name,
        email,
        // password intentionally omitted for OAuth users to avoid minlength validation
        role: "candidate",
        oauthProvider: "google",
        oauthId: googleId,
        avatarUrl: avatar,
      });
      await user.save();
    }

    const token = makeJwt(user);
    res.json({
      message: "Google login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error?.message || error);
    // In development, surface the specific error to help configuration
    if (process.env.NODE_ENV !== "production") {
      return res.status(400).json({ message: error?.message || "Google authentication failed." });
    }
    res.status(500).json({ message: "Server error during Google authentication." });
  }
};

// GitHub flow removed upon request

/**
 * LINKEDIN OAUTH (Authorization Code flow)
 * Frontend sends { code, redirectUri }
 */
// LinkedIn flow removed upon request

/**
 * Recruiter-only: create a candidate user
 */
export const createCandidate = async (req, res) => {
  try {
    if (req.user?.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can create candidates." });
    }
    
    // Get the recruiter's company
    const recruiter = await User.findById(req.user.id).select("recruiterCompany");
    if (!recruiter?.recruiterCompany) {
      return res.status(400).json({ message: "Recruiter company not found." });
    }
    
    const { name, email, wishedSalary, earlyStartDate, candidateNotes, jobTitle, experience, skills, location } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required." });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists." });
    
    const user = new User({ 
      name, 
      email, 
      role: "candidate", 
      oauthProvider: "recruiter-created", // Mark as recruiter-created to bypass password requirement
      wishedSalary,
      earlyStartDate: earlyStartDate ? new Date(earlyStartDate) : null,
      candidateNotes,
      jobTitle,
      company: recruiter.recruiterCompany, // Automatically assign recruiter's company
      experience,
      skills,
      location,
      recruiterCompany: recruiter.recruiterCompany // Assign to recruiter's company for data isolation
    });
    // No password for recruiter-created candidate; candidate can complete account later via email flow
    await user.save();
    res.status(201).json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      wishedSalary: user.wishedSalary, 
      earlyStartDate: user.earlyStartDate, 
      candidateNotes: user.candidateNotes,
      jobTitle: user.jobTitle,
      company: user.company,
      experience: user.experience,
      skills: user.skills,
      location: user.location
    });
  } catch (error) {
    console.error("Create candidate error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ 
      message: "Server error creating candidate.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Recruiter-only: list candidates
 */
export const listCandidates = async (req, res) => {
  try {
    if (req.user?.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can list candidates." });
    }
    
    // Get the recruiter's company
    const recruiter = await User.findById(req.user.id).select("recruiterCompany");
    if (!recruiter?.recruiterCompany) {
      return res.status(400).json({ message: "Recruiter company not found." });
    }
    
    // Filter candidates by the recruiter's company
    const users = await User.find({ 
      role: "candidate",
      company: recruiter.recruiterCompany 
    }).select("name email role createdAt wishedSalary earlyStartDate candidateNotes jobTitle company experience skills location");
    
    res.json(users);
  } catch (error) {
    console.error("List candidates error:", error.message);
    res.status(500).json({ message: "Server error listing candidates." });
  }
};

/**
 * Recruiter-only: update a candidate
 */
export const updateCandidate = async (req, res) => {
  try {
    if (req.user?.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update candidates." });
    }
    const { id } = req.params;
    const { name, email, wishedSalary, earlyStartDate, candidateNotes, jobTitle, company, experience, skills, location } = req.body;
    
    const candidate = await User.findOne({ _id: id, role: "candidate" });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== candidate.email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (wishedSalary !== undefined) updateData.wishedSalary = wishedSalary;
    if (earlyStartDate !== undefined) updateData.earlyStartDate = earlyStartDate ? new Date(earlyStartDate) : null;
    if (candidateNotes !== undefined) updateData.candidateNotes = candidateNotes;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (company !== undefined) updateData.company = company;
    if (experience !== undefined) updateData.experience = experience;
    if (skills !== undefined) updateData.skills = skills;
    if (location !== undefined) updateData.location = location;
    
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("name email role wishedSalary earlyStartDate candidateNotes jobTitle company experience skills location");
    res.json(updated);
  } catch (error) {
    console.error("Update candidate error:", error.message);
    res.status(500).json({ message: "Server error updating candidate." });
  }
};

/**
 * Recruiter-only: delete a candidate
 */
export const deleteCandidate = async (req, res) => {
  try {
    if (req.user?.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can delete candidates." });
    }
    const { id } = req.params;
    
    const candidate = await User.findOne({ _id: id, role: "candidate" });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }
    
    // Also delete all applications for this candidate
    const Application = (await import("../models/Application.js")).default;
    await Application.deleteMany({ candidateId: id });
    
    await User.findByIdAndDelete(id);
    res.json({ message: "Candidate deleted successfully." });
  } catch (error) {
    console.error("Delete candidate error:", error.message);
    res.status(500).json({ message: "Server error deleting candidate." });
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ message: "Server error getting profile." });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, recruiterCompany, location, strivingFor } = req.body;
    
    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (recruiterCompany !== undefined) updateData.recruiterCompany = recruiterCompany;
    if (location !== undefined) updateData.location = location;
    if (strivingFor !== undefined) updateData.strivingFor = strivingFor;
    
    const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");
    res.json(updated);
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Server error updating profile." });
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(500).json({ message: "Server error changing password." });
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete all applications for this user
    const Application = (await import("../models/Application.js")).default;
    await Application.deleteMany({ candidateId: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete account error:", error.message);
    res.status(500).json({ message: "Server error deleting account." });
  }
};
