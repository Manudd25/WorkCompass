import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied." });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Token is not valid." });
    }

    // Attach user info to request
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) return res.status(401).json({ message: "User not found." });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Authorization failed." });
  }
};

export default authMiddleware;
