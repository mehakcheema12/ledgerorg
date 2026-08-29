import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: null,
    },
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },
    dailyEntries: {
      type: [{
        date: { type: String, required: true },
        mood: { type: String, default: "" },
        note: { type: String, default: "" },
      }],
      default: [],
    },
    plannerTasks: {
      type: [{
        date: { type: String, required: true },
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
      }],
      default: [],
    },
    stamps: {
      type: [{
        key: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model("User", userSchema);
