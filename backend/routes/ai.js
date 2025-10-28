import express from 'express';
import { 
  generateApplicationInsights,
  generateInterviewPrep,
  generateJobRecommendations,
  aiChat,
  guestChat
} from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Guest AI chat endpoint (no authentication required)
router.post('/guest-chat', guestChat);

// All other AI routes require authentication
router.use(authMiddleware);

// Generate application insights
router.get('/insights/:applicationId', generateApplicationInsights);

// Generate interview preparation
router.get('/interview-prep/:applicationId', generateInterviewPrep);

// Generate job recommendations
router.get('/recommendations', generateJobRecommendations);

// AI Chat
router.post('/chat', aiChat);

export default router;
