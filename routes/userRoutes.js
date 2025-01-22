import express from "express";
import { userSignup, userLogin, userProfile, userLogout } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Authentication Routes
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/profile", protect, userProfile);
router.post("/logout", userLogout);

export default router;
