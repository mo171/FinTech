import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { evaluateRequest } from '../controllers/compliance.controller.js';

const router = express.Router();

router.post('/evaluate', requireAuth, evaluateRequest);

export default router;
