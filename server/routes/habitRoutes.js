import express from "express";
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabitCompletion,
  unlogHabit,
  getHabitLogs,
} from "../controllers/habitController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.get("/", getHabits);
router.post("/", createHabit);

// Habit logging endpoints
router.post("/log/complete", logHabitCompletion);
router.post("/log/uncomplete", unlogHabit);
router.get("/logs", getHabitLogs);

router.get("/:id", getHabit);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

export default router;
