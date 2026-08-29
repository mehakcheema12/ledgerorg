import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, theme, stamps } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, theme, ...(stamps ? { stamps } : {}) },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};


export const getPersonalData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("dailyEntries plannerTasks stamps");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const upsertDayEntry = async (req, res, next) => {
  try {
    const { date, mood = "", note = "" } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const existing = user.dailyEntries.find((entry) => entry.date === date);
    if (existing) {
      existing.mood = mood;
      existing.note = note;
    } else {
      user.dailyEntries.push({ date, mood, note });
    }
    await user.save();
    res.json({ entry: user.dailyEntries.find((entry) => entry.date === date) });
  } catch (error) {
    next(error);
  }
};

export const createPlannerTask = async (req, res, next) => {
  try {
    const { date, text, priority = "medium" } = req.body;
    if (!date || !text?.trim()) return res.status(400).json({ message: "Date and task text are required" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.plannerTasks.push({ date, text: text.trim(), priority });
    await user.save();
    res.status(201).json(user.plannerTasks[user.plannerTasks.length - 1]);
  } catch (error) {
    next(error);
  }
};

export const updatePlannerTask = async (req, res, next) => {
  try {
    const { text, completed, priority, date } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const task = user.plannerTasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (text !== undefined) task.text = text.trim();
    if (completed !== undefined) task.completed = completed;
    if (priority !== undefined) task.priority = priority;
    if (date !== undefined) task.date = date;
    await user.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deletePlannerTask = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const task = user.plannerTasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.deleteOne();
    await user.save();
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};
