import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { HabitContext } from "../context/HabitContext";
import { habitService, analyticsService } from "../services/api";
import HabitCard from "../components/HabitCard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const { habits, setHabitsData, loading, setLoading } = useContext(HabitContext);
  const [analytics, setAnalytics] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    category: "other",
    frequency: "daily",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchHabits();
    fetchAnalytics();
  }, [token]);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const data = await habitService.getHabits(token);
      setHabitsData(data);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await analyticsService.getDashboardAnalytics(token);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    try {
      const data = await habitService.createHabit(token, newHabit);
      setHabitsData([data, ...habits]);
      setNewHabit({
        name: "",
        description: "",
        category: "other",
        frequency: "daily",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-coral animate-flicker"
            >
              <path
                d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-2 1 4-1 6-3 6a3 3 0 0 1-3-3c0-3 2-4 1-8Z"
                fill="currentColor"
              />
            </svg>
            <span className="font-display text-xl text-text">Ledger</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-text-muted text-sm">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-text-muted hover:text-text transition-colors text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Analytics Overview */}
        {analytics && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl border border-border bg-surface">
              <p className="text-text-muted text-sm mb-2">Active Habits</p>
              <p className="font-display text-4xl text-lavender">{analytics.totalHabits}</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface">
              <p className="text-text-muted text-sm mb-2">Active Streaks</p>
              <p className="font-display text-4xl text-coral">{analytics.activeStreaks}</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface">
              <p className="text-text-muted text-sm mb-2">Avg Completion Rate</p>
              <p className="font-display text-4xl text-mint">{analytics.avgCompletionRate}%</p>
            </div>
          </div>
        )}

        {/* Add Habit Section */}
        <div className="mb-12">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-border rounded-lg text-text-muted hover:border-lavender hover:text-lavender transition-colors font-medium"
            >
              + New habit
            </button>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-surface">
              <h3 className="font-display text-lg text-text mb-4">Create a new habit</h3>
              <form onSubmit={handleAddHabit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Habit name *
                  </label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                    placeholder="e.g., Morning meditation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Description
                  </label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                    placeholder="What's this habit about?"
                    rows="2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Category
                    </label>
                    <select
                      value={newHabit.category}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, category: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                    >
                      <option value="health">Health</option>
                      <option value="productivity">Productivity</option>
                      <option value="learning">Learning</option>
                      <option value="fitness">Fitness</option>
                      <option value="mindfulness">Mindfulness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Frequency
                    </label>
                    <select
                      value={newHabit.frequency}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, frequency: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-lavender text-bg font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Create habit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 border border-border text-text-muted rounded-lg hover:border-text transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Habits Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-muted">Loading habits...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No habits yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <HabitCard key={habit._id} habit={habit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
