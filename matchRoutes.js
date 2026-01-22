import express from "express";
import { createMatch } from "./AuthController.js";
import { authMiddleware } from "./AuthMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createMatch);

export default router;
