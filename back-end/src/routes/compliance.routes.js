import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  evaluateRequest,
  getLatestEvaluation,
} from "../controllers/compliance.controller.js";

const router = express.Router();

router.post("/evaluate", requireAuth, evaluateRequest);
router.get("/latest-evaluation", requireAuth, getLatestEvaluation);

export default router;
