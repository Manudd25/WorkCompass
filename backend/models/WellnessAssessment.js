import mongoose from 'mongoose';

const wellnessAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  scores: {
    sleep: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    diet: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    exercise: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    workLife: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    social: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  },
  overallScore: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('WellnessAssessment', wellnessAssessmentSchema);

