import express from "express";
import { updateUser, deleteUser } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/me", protect, updateUser);
router.delete("/me", protect, deleteUser);

export default router;
