import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

// Get dashboard analytics
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id, isActive: true });

    const totalHabits = habits.length;
    const activeStreaks = habits.reduce((sum, h) => sum + (h.currentStreak > 0 ? 1 : 0), 0);
    const avgCompletionRate = habits.length > 0 
      ? Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length)
      : 0;

    res.json({
      totalHabits,
      activeStreaks,
      avgCompletionRate,
      habits: habits.sort((a, b) => b.currentStreak - a.currentStreak),
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics for a specific habit
export const getHabitAnalytics = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Get last 90 days of logs
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    startDate.setHours(0, 0, 0, 0);

    const logs = await HabitLog.find({
      habitId,
      userId: req.user.id,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    // Create calendar data
    const calendarData = {};
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split("T")[0];
      calendarData[dateStr] = 0;
    }

    logs.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0];
      if (calendarData.hasOwnProperty(dateStr)) {
        calendarData[dateStr] = log.count || 1;
      }
    });

    res.json({
      habit,
      calendarData,
      totalLogs: logs.length,
      completedDays: logs.filter((l) => l.completed).length,
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly analytics
export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const analyticsMonth = month ? parseInt(month) : currentDate.getMonth();
    const analyticsYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(analyticsYear, analyticsMonth, 1);
    const endDate = new Date(analyticsYear, analyticsMonth + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const habits = await Habit.find({ userId: req.user.id, isActive: true });

    const logs = await HabitLog.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    });

    // Group logs by habit
    const habitStats = {};
    habits.forEach((habit) => {
      habitStats[habit._id] = {
        name: habit.name,
        completions: 0,
        daysCompleted: 0,
      };
    });

    logs.forEach((log) => {
      if (habitStats[log.habitId]) {
        habitStats[log.habitId].completions += log.count || 1;
        habitStats[log.habitId].daysCompleted += 1;
      }
    });

    res.json({
      month: analyticsMonth,
      year: analyticsYear,
      totalDaysInMonth: endDate.getDate(),
      habits: Object.values(habitStats),
    });
  } catch (error) {
    next(error);
  }
};

// Get streak rankings (leaderboard-style)
export const getStreakRankings = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id, isActive: true })
      .sort({ currentStreak: -1 })
      .limit(10);

    res.json(habits);
  } catch (error) {
    next(error);
  }
};
