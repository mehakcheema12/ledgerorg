import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services/api";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.register(name, email, password, confirmPassword);
      if (data.error) {
        setError(data.error);
      } else {
        register(data.user, data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-lg">
          <h1 className="font-display text-3xl mb-2">Join Ledger</h1>
          <p className="text-text-muted mb-6">Start tracking your habits today</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-lavender"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-lavender text-bg font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-lavender hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
