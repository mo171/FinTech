/*
 * AUTHENTICATION MIDDLEWARE
 * This module is responsible for protecting routes by validating JWT tokens.
 * Interactions:
 * - Extracts the Bearer token from the Authorization header.
 * - Verifies the token directly with Supabase Auth.
 * - Attaches the authenticated user's ID and email to the request object for use in controllers.
 */

import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../utils/supabase.js";

/**
 * requireAuth
 * Express middleware that checks for a valid Bearer token.
 * If the token is valid, it calls next().
 * If the token is missing, invalid, or expired, it returns a 401 Unauthorized response.
 */
export const requireAuth = async (req, res, next) => {
  try {
    // - EXTRACT AUTHORIZATION HEADER
    const authHeader = req.headers.authorization; // Expected format: "Bearer <token>"
    if (!authHeader) {
      return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.replace("Bearer ", "");

    // - VALIDATE TOKEN WITH SUPABASE AUTH (Direct lookup)
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }

    // - ATTACH USER TO REQUEST
    // Making this information globally available to any subsequent controller or service
    req.user = {
      id: user.id,
      email: user.email,
      role: user.app_metadata?.role || user.user_metadata?.role,
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
