import express from "express";
import {
  getDashboardAnalytics,
  getHabitAnalytics,
  getMonthlyAnalytics,
  getStreakRankings,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.get("/dashboard", getDashboardAnalytics);
router.get("/habit/:habitId", getHabitAnalytics);
router.get("/monthly", getMonthlyAnalytics);
router.get("/streaks", getStreakRankings);

export default router;
