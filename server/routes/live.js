import express from 'express';
import { getLiveMetrics } from '../services/websocket.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get real-time active users and marksheet viewers
router.get('/metrics', authenticateToken, requireRole('super_admin', 'principal', 'exam_controller', 'hod', 'faculty'), (req, res) => {
  const metrics = getLiveMetrics();
  res.json({
    metrics,
    timestamp: new Date().toISOString()
  });
});

export default router;
