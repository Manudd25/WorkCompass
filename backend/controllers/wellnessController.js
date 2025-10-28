import MoodEntry from '../models/MoodEntry.js';
import WellnessAssessment from '../models/WellnessAssessment.js';

// Get all mood entries for a user
export const getMoodEntries = async (req, res) => {
  try {
    const userId = req.user._id;
    const entries = await MoodEntry.find({ userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new mood entry
export const createMoodEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, mood, energy, stress, notes } = req.body;
    
    const entry = await MoodEntry.create({
      userId,
      date,
      mood,
      energy,
      stress,
      notes
    });
    
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a mood entry
export const updateMoodEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { date, mood, energy, stress, notes } = req.body;
    
    const entry = await MoodEntry.findOneAndUpdate(
      { _id: id, userId },
      { date, mood, energy, stress, notes },
      { new: true }
    );
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a mood entry
export const deleteMoodEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const entry = await MoodEntry.findOneAndDelete({ _id: id, userId });
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all wellness assessments for a user
export const getWellnessAssessments = async (req, res) => {
  try {
    const userId = req.user._id;
    const assessments = await WellnessAssessment.find({ userId }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new wellness assessment
export const createWellnessAssessment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, scores, overallScore, notes } = req.body;
    
    const assessment = await WellnessAssessment.create({
      userId,
      date,
      scores,
      overallScore,
      notes
    });
    
    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a wellness assessment
export const updateWellnessAssessment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { date, scores, overallScore, notes } = req.body;
    
    const assessment = await WellnessAssessment.findOneAndUpdate(
      { _id: id, userId },
      { date, scores, overallScore, notes },
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a wellness assessment
export const deleteWellnessAssessment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const assessment = await WellnessAssessment.findOneAndDelete({ _id: id, userId });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

