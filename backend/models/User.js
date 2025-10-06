import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      },
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter"],
      default: "candidate",
    },
    oauthProvider: {
      type: String,
      enum: ["google", "github", "linkedin", "facebook", "recruiter-created", null],
      default: null,
    },
    oauthId: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    wishedSalary: {
      type: String,
      default: null,
    },
    earlyStartDate: {
      type: Date,
      default: null,
    },
    candidateNotes: {
      type: String,
      default: null,
    },
    jobTitle: {
      type: String,
      default: null,
    },
    company: {
      type: String,
      default: null,
    },
    experience: {
      type: String,
      default: null,
    },
    skills: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    strivingFor: {
      type: String,
      default: null,
    },
    recruiterCompany: {
      type: String,
      default: null,
    },
  },
  { timestamps: true } 
);

const User = mongoose.model("User", UserSchema);

export default User;
