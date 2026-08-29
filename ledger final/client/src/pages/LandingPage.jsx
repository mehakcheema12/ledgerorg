import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg to-surface">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-coral"
          >
            <path
              d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-2 1 4-1 6-3 6a3 3 0 0 1-3-3c0-3 2-4 1-8Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-display text-xl text-text">Ledger</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 text-text hover:text-lavender transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2 bg-lavender text-bg rounded-lg hover:opacity-90 font-medium transition-opacity"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-6xl lg:text-7xl leading-tight mb-6 text-text">
          Make your streak <span className="text-coral">burn</span>
        </h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12">
          A habit tracker that makes consistency feel good. Real streaks, real analytics, no fake data.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="px-8 py-4 bg-lavender text-bg rounded-lg font-medium hover:opacity-90 transition-opacity text-lg"
        >
          Start tracking free
        </button>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-lavender text-bg flex items-center justify-center font-display text-xl mb-4">
              🔥
            </div>
            <h3 className="font-display text-lg mb-2 text-text">Real streaks</h3>
            <p className="text-text-muted">
              Watch your streak grow day by day. No gaming the system—just consistency.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-coral text-bg flex items-center justify-center font-display text-xl mb-4">
              📊
            </div>
            <h3 className="font-display text-lg mb-2 text-text">Deep analytics</h3>
            <p className="text-text-muted">
              Understand your habits with monthly insights, completion rates, and trends.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-mint text-bg flex items-center justify-center font-display text-xl mb-4">
              ⚡
            </div>
            <h3 className="font-display text-lg mb-2 text-text">Made to stick</h3>
            <p className="text-text-muted">
              Beautiful, fast, and focused. No distractions. Just you and your goals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-text-muted mb-6">Ready to build better habits?</p>
        <button
          onClick={() => navigate("/register")}
          className="px-8 py-4 bg-lavender text-bg rounded-lg font-medium hover:opacity-90 transition-opacity text-lg"
        >
          Get started today
        </button>
      </section>
    </div>
  );
}
