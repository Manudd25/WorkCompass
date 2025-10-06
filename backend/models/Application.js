import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Applied", "Interview", "Offer", "Rejected"],
    default: "Applied",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  // Interview scheduling fields
  interviewTime: {
    type: String,
  },
  interviewDate: {
    type: Date,
  },
  interviewLocation: {
    type: String,
  },
  interviewType: {
    type: String,
    enum: ["video", "phone", "in-person"],
  },
  interviewNotes: {
    type: String,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recruiterCompany: {
    type: String,
  },
});


const Application = mongoose.model("Application", ApplicationSchema);

export default Application;
