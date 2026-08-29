import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  getPersonalData,
  upsertDayEntry,
  createPlannerTask,
  updatePlannerTask,
  deletePlannerTask,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.get("/personal", protect, getPersonalData);
router.put("/day", protect, upsertDayEntry);
router.post("/tasks", protect, createPlannerTask);
router.put("/tasks/:taskId", protect, updatePlannerTask);
router.delete("/tasks/:taskId", protect, deletePlannerTask);

export default router;
