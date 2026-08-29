import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

// Get all habits for user
export const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    next(error);
  }
};

// Get single habit
export const getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.json(habit);
  } catch (error) {
    next(error);
  }
};

// Create habit
export const createHabit = async (req, res, next) => {
  try {
    const { name, description, category, frequency, color, icon, goalCount } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }

    const habit = new Habit({
      userId: req.user.id,
      name,
      description,
      category,
      frequency,
      color,
      icon,
      goalCount,
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

// Update habit
export const updateHabit = async (req, res, next) => {
  try {
    const { name, description, category, frequency, color, icon, goalCount, isActive, notes } = req.body;
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, description, category, frequency, color, icon, goalCount, isActive, ...(notes ? { notes } : {}) },
      { new: true, runValidators: true }
    );
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.json(habit);
  } catch (error) {
    next(error);
  }
};

// Delete habit
export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    // Also delete all logs for this habit
    await HabitLog.deleteMany({ habitId: habit._id });
    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Log habit completion
export const logHabitCompletion = async (req, res, next) => {
  try {
    const { habitId, date, count = 1, notes = "" } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ message: "Habit ID and date are required" });
    }

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Parse date
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Check if log already exists for this date
    let log = await HabitLog.findOne({ habitId, userId: req.user.id, date: logDate });

    if (log) {
      log.completed = true;
      log.count = count;
      log.notes = notes;
    } else {
      log = new HabitLog({
        habitId,
        userId: req.user.id,
        date: logDate,
        completed: true,
        count,
        notes,
      });
    }

    await log.save();

    // Update habit stats
    await updateHabitStats(habitId);

    res.json({ message: "Habit logged successfully", log });
  } catch (error) {
    next(error);
  }
};

// Unlog habit (mark as incomplete)
export const unlogHabit = async (req, res, next) => {
  try {
    const { habitId, date } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ message: "Habit ID and date are required" });
    }

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    await HabitLog.deleteOne({ habitId, userId: req.user.id, date: logDate });

    // Update habit stats
    await updateHabitStats(habitId);

    res.json({ message: "Habit log removed successfully" });
  } catch (error) {
    next(error);
  }
};

// Get habit logs for a date range
export const getHabitLogs = async (req, res, next) => {
  try {
    const { habitId, startDate, endDate } = req.query;

    const query = { userId: req.user.id };

    if (habitId) {
      const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }

      query.habitId = habitId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const logs = await HabitLog.find(query).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// Calculate and update habit stats (streak, completion rate, etc.)
async function updateHabitStats(habitId) {
  const habit = await Habit.findById(habitId);
  if (!habit) return;

  // Get all logs for this habit
  const logs = await HabitLog.find({ habitId, completed: true }).sort({ date: 1 });

  if (logs.length === 0) {
    habit.currentStreak = 0;
    habit.longestStreak = 0;
    habit.totalCompletions = 0;
    habit.completionRate = 0;
    habit.lastCompletedDate = null;
    await habit.save();
    return;
  }

  // Calculate total completions
  habit.totalCompletions = logs.length;

  // Calculate current and longest streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastDate = null;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      lastDateObj.setHours(0, 0, 0, 0);
      const dayDiff = (logDate - lastDateObj) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak += 1;
      } else if (dayDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    lastDate = new Date(log.date);
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Check if streak continues today or yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastCompletionDate = new Date(logs[logs.length - 1].date);
  lastCompletionDate.setHours(0, 0, 0, 0);

  if (lastCompletionDate.getTime() === today.getTime() || lastCompletionDate.getTime() === yesterday.getTime()) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  habit.currentStreak = currentStreak;
  habit.longestStreak = longestStreak;
  habit.lastCompletedDate = logs[logs.length - 1].date;

  // Calculate completion rate (percentage of days habit was tracked)
  const firstLog = logs[0];
  const lastLog = logs[logs.length - 1];
  const totalDays = (new Date(lastLog.date) - new Date(firstLog.date)) / (1000 * 60 * 60 * 24) + 1;
  habit.completionRate = Math.round((logs.length / totalDays) * 100);

  await habit.save();
}
