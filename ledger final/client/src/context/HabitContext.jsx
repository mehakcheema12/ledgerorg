import React, { createContext, useState, useCallback } from "react";

export const HabitContext = createContext();

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitLogs, setHabitLogs] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const addHabit = useCallback((habit) => {
    setHabits((prev) => [habit, ...prev]);
  }, []);

  const updateHabit = useCallback((id, updates) => {
    setHabits((prev) =>
      prev.map((h) => (h._id === id ? { ...h, ...updates } : h))
    );
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h._id !== id));
    if (selectedHabit?._id === id) {
      setSelectedHabit(null);
    }
  }, [selectedHabit]);

  const setHabitsData = useCallback((data) => {
    setHabits(data);
  }, []);

  const addHabitLog = useCallback((habitId, log) => {
    setHabitLogs((prev) => ({
      ...prev,
      [habitId]: [...(prev[habitId] || []), log],
    }));
  }, []);

  return (
    <HabitContext.Provider
      value={{
        habits,
        setHabitsData,
        addHabit,
        updateHabit,
        deleteHabit,
        selectedHabit,
        setSelectedHabit,
        habitLogs,
        addHabitLog,
        analytics,
        setAnalytics,
        loading,
        setLoading,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}
