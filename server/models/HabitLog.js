import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 1,
      description: "How many times completed on this date",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
habitLogSchema.index({ habitId: 1, userId: 1, date: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, date: -1 });
habitLogSchema.index({ date: 1 });

export default mongoose.model("HabitLog", habitLogSchema);
