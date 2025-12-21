/*
   - COMPLIANCE ROUTES
   - POST REQUEST GET REQUEST AND MIDDLEWARES WILL BE HANDLED 
   - SECURED AND UNSECURED ROUTES WILL BE HANDLED
*/

import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js"; // SECURED ROUTE MIDDLEWARE
import {
  evaluateRequest,
} from "../controllers/compliance.controller.js";

const router = express.Router();

// - SECURED ROUTES
router.post("/evaluate", requireAuth, evaluateRequest) // * http real-time chat will take place through this route

export default router;
