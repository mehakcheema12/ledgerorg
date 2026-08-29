import React, { useContext, useState } from "react";
import { HabitContext } from "../context/HabitContext";
import { AuthContext } from "../context/AuthContext";
import { habitService } from "../services/api";

export default function HabitCard({ habit }) {
  const { token } = useContext(AuthContext);
  const { updateHabit } = useContext(HabitContext);
  const [isLogging, setIsLogging] = useState(false);

  const handleToggleCompletion = async () => {
    setIsLogging(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const hasCompletedToday = habit.lastCompletedDate
        ? new Date(habit.lastCompletedDate).toISOString().split("T")[0] === today
        : false;

      if (hasCompletedToday) {
        await habitService.unlogCompletion(token, habit._id, today);
      } else {
        await habitService.logCompletion(token, habit._id, today);
      }

      // Update local state
      updateHabit(habit._id, {
        ...habit,
        currentStreak: hasCompletedToday ? habit.currentStreak - 1 : habit.currentStreak + 1,
        totalCompletions: hasCompletedToday ? habit.totalCompletions - 1 : habit.totalCompletions + 1,
      });
    } catch (error) {
      console.error("Error logging habit:", error);
    } finally {
      setIsLogging(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const completedToday = habit.lastCompletedDate
    ? new Date(habit.lastCompletedDate).toISOString().split("T")[0] === today
    : false;

  return (
    <div className="p-4 rounded-xl border border-border bg-surface hover:border-lavender transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-text">{habit.name}</h3>
          <p className="text-text-muted text-sm">{habit.description}</p>
        </div>
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: habit.color }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-bg p-2 rounded-lg">
          <p className="text-text-muted text-xs">Current Streak</p>
          <p className="font-display text-2xl text-coral">{habit.currentStreak}</p>
        </div>
        <div className="bg-bg p-2 rounded-lg">
          <p className="text-text-muted text-xs">Longest Streak</p>
          <p className="font-display text-2xl text-mint">{habit.longestStreak}</p>
        </div>
      </div>

      <button
        onClick={handleToggleCompletion}
        disabled={isLogging}
        className={`w-full py-2 rounded-lg font-medium transition-all ${
          completedToday
            ? "bg-coral text-bg"
            : "bg-lavender text-bg hover:opacity-90"
        } disabled:opacity-50`}
      >
        {isLogging
          ? "Loading..."
          : completedToday
          ? "✓ Completed today"
          : "Log completion"}
      </button>
    </div>
  );
}
