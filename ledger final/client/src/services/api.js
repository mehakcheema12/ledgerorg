const API_BASE_URL = "http://localhost:5001/api";

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Auth Services
export const authService = {
  async register(name, email, password, confirmPassword) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getCurrentUser(token) {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async updateProfile(token, data) {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// Habit Services
export const habitService = {
  async getHabits(token) {
    const res = await fetch(`${API_BASE_URL}/habits`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getHabit(token, id) {
    const res = await fetch(`${API_BASE_URL}/habits/${id}`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async createHabit(token, habitData) {
    const res = await fetch(`${API_BASE_URL}/habits`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(habitData),
    });
    return res.json();
  },

  async updateHabit(token, id, habitData) {
    const res = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(habitData),
    });
    return res.json();
  },

  async deleteHabit(token, id) {
    const res = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    return res.json();
  },

  async logCompletion(token, habitId, date, count = 1, notes = "") {
    const res = await fetch(`${API_BASE_URL}/habits/log/complete`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ habitId, date, count, notes }),
    });
    return res.json();
  },

  async unlogCompletion(token, habitId, date) {
    const res = await fetch(`${API_BASE_URL}/habits/log/uncomplete`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ habitId, date }),
    });
    return res.json();
  },

  async getHabitLogs(token, habitId, startDate, endDate) {
    const params = new URLSearchParams({ habitId });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const res = await fetch(`${API_BASE_URL}/habits/logs?${params}`, {
      headers: getHeaders(token),
    });
    return res.json();
  },
};

// Analytics Services
export const analyticsService = {
  async getDashboardAnalytics(token) {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getHabitAnalytics(token, habitId) {
    const res = await fetch(`${API_BASE_URL}/analytics/habit/${habitId}`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getMonthlyAnalytics(token, month, year) {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    const res = await fetch(`${API_BASE_URL}/analytics/monthly?${params}`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async getStreakRankings(token) {
    const res = await fetch(`${API_BASE_URL}/analytics/streaks`, {
      headers: getHeaders(token),
    });
    return res.json();
  },
};
