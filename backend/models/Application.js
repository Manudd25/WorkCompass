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
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});


const Application = mongoose.model("Application", ApplicationSchema);

export default Application;
