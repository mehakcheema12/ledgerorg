import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["health", "productivity", "learning", "fitness", "mindfulness", "other"],
      default: "other",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },
    color: {
      type: String,
      default: "#B9A6FF",
    },
    icon: {
      type: String,
      default: "star",
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    goalCount: {
      type: Number,
      default: 1,
      description: "Target completions per frequency period",
    },
    notes: {
      type: [{
        date: { type: String, required: true },
        text: { type: String, default: "" },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

habitSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Habit", habitSchema);
