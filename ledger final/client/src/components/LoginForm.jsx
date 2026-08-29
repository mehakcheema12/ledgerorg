import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services/api";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      if (data.error) {
        setError(data.error);
      } else {
        login(data.user, data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-lg">
          <h1 className="font-display text-3xl mb-2">Welcome back</h1>
          <p className="text-text-muted mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-lavender text-bg font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-lavender hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
