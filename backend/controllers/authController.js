import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../services/emailService.js";
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

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(newUser.email, newUser.name).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

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

/**
 * Request password reset
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Password reset requested for email: ${email}`);

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      // Don't reveal if user exists or not for security
      return res.json({ message: "If an account with that email exists, password reset instructions have been sent." });
    }

    console.log(`User found: ${user.name} (${user.email})`);

    // Check if user has a password (not OAuth-only)
    if (!user.password || user.oauthProvider) {
      console.log(`User ${email} is OAuth-only, cannot reset password`);
      return res.status(400).json({ 
        message: "This account was created with Google. Please use 'Sign in with Google' instead of password reset." 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`Generated reset token for ${email}`);

    // Store reset token in user document
    await User.findByIdAndUpdate(user._id, { 
      resetToken,
      resetTokenExpires: new Date(Date.now() + 3600000) // 1 hour from now
    });

    console.log(`Reset token stored in database for ${email}`);

    // Send password reset email
    try {
      console.log(`Attempting to send password reset email to ${email}`);
      await sendPasswordResetEmail(email, resetToken, user.name);
      console.log(`✅ Password reset email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send password reset email to ${email}:`, emailError);
      // Still return success to user for security (don't reveal if email failed)
    }

    res.json({ 
      message: "If an account with that email exists, password reset instructions have been sent."
    });
  } catch (error) {
    console.error("Request password reset error:", error.message);
    res.status(500).json({ message: "Server error requesting password reset." });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Check if token is for password reset
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    // Find user and verify token matches
    const user = await User.findOne({ 
      _id: decoded.id, 
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpires: undefined
    });

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ message: "Server error resetting password." });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;
    
    console.log(`📧 New feedback received:`, { name, email, rating, message: message.substring(0, 50) + '...' });
    
    // Send feedback email to your personal email
    const feedbackEmail = {
      from: `"WorkCompass Feedback" <${process.env.EMAIL_FROM || 'noreply@workcompass.com'}>`,
      to: process.env.SMTP_USER, // Your personal email
      subject: `WorkCompass Feedback - ${rating}⭐ Rating`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">💬 New WorkCompass Feedback</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="font-size: 32px; margin-right: 15px;">${'⭐'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
              <div>
                <strong style="font-size: 18px; color: #2563eb;">${rating}/5 Stars</strong>
              </div>
            </div>
            
            ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
            ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Message:</strong>
              <p style="margin: 10px 0 0 0; line-height: 1.6; color: #333;">${message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Received on ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const { sendFeedbackEmail } = await import("../services/emailService.js");
      await sendFeedbackEmail(feedbackEmail);
      console.log(`✅ Feedback email sent successfully to ${process.env.SMTP_USER}`);
    } catch (emailError) {
      console.error(`❌ Failed to send feedback email:`, emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Submit feedback error:", error.message);
    res.status(500).json({ message: "Server error submitting feedback." });
  }
};
