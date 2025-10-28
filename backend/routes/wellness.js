import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getMoodEntries,
  createMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getWellnessAssessments,
  createWellnessAssessment,
  updateWellnessAssessment,
  deleteWellnessAssessment
} from '../controllers/wellnessController.js';

const router = express.Router();

// Apply authentication middleware to all wellness routes
router.use(authMiddleware);

// Mood Entry routes
router.get('/mood-entries', getMoodEntries);
router.post('/mood-entries', createMoodEntry);
router.put('/mood-entries/:id', updateMoodEntry);
router.delete('/mood-entries/:id', deleteMoodEntry);

// Wellness Assessment routes
router.get('/assessments', getWellnessAssessments);
router.post('/assessments', createWellnessAssessment);
router.put('/assessments/:id', updateWellnessAssessment);
router.delete('/assessments/:id', deleteWellnessAssessment);

export default router;

