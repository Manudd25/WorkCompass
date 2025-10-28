import mongoose from 'mongoose';

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'excited', 'calm', 'neutral', 'frustrated', 'anxious', 'sad']
  },
  energy: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  stress: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('MoodEntry', moodEntrySchema);

